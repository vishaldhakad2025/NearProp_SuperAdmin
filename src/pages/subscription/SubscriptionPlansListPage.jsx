// src/pages/subscription/SubscriptionPlansListPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
    getAllSubscriptionPlans,
    toggleSubscriptionPlanStatus,
    getSingleSubscriptionPlan,
    deleteSubscriptionPlan,
} from "../../redux/slices/subscriptionPlanSlice";
import Swal from "sweetalert2";

import {
    Table,
    Button,
    Tag,
    Space,
    Tooltip,
    Switch,
    Spin,
    Modal,
    Descriptions,
} from "antd";
import {
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

const SubscriptionPlansListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { plans, totalElements, loading, singlePlan } = useSelector(
        (state) => state.subscriptionPlans
    );

    const [page, setPage] = useState(1);
    const [viewModal, setViewModal] = useState(false);

    // fetch subscription plans
    const fetchPlans = () => {
        dispatch(getAllSubscriptionPlans({ page: page - 1, size: 10 }));
    };

    useEffect(() => {
        fetchPlans();
    }, [dispatch, page,navigate]);

    // ✅ auto-refresh when redirected back from create/edit
    useEffect(() => {
        if (location.state?.refresh) {
            fetchPlans();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const confirmToggle = (record) => {
        Swal.fire({
            title: `${record.active ? "Deactivate" : "Activate"} this plan?`,
            text: `Are you sure you want to ${record.active ? "deactivate" : "activate"} the "${record.name}" plan?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: record.active ? "Yes, Deactivate" : "Yes, Activate",
            cancelButtonText: "Cancel",
            confirmButtonColor: record.active ? "#d33" : "#3085d6",
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(toggleSubscriptionPlanStatus({ planId: record.id, active: record.active }))
                    .then(() => fetchPlans()); // ✅ refresh after toggle
            }
        });
    };

    const handleDelete = (record) => {
        Swal.fire({
            title: "Delete this plan?",
            text: `Are you sure you want to delete the "${record.name}" plan? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteSubscriptionPlan(record.id))
                    .then(() => fetchPlans()); // ✅ refresh after delete
            }
        });
    };

    const handleView = (id) => {
        dispatch(getSingleSubscriptionPlan(id)).then(() => setViewModal(true));
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            className: "font-semibold",
        },
        {
            title: "Type",
            dataIndex: "type",
            render: (type) => (
                <Tag color={type === "SELLER" ? "blue" : "purple"}>{type}</Tag>
            ),
        },
        {
            title: "Price",
            dataIndex: "price",
            render: (val) => `₹${val.toLocaleString()}`,
        },
        {
            title: "Duration (Days)",
            dataIndex: "durationDays",
        },
        {
            title: "Max Properties",
            dataIndex: "maxProperties",
        },
        {
            title: "Status",
            dataIndex: "active",
            render: (active, record) => (
                <Switch
                    checked={active}
                    onChange={() => confirmToggle(record)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            ),
        },
        {
            title: "Action",
            render: (_, record) => (
                <Space>
                    <Tooltip title="View">
                        <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/dashboard/subscription/edit/${record.id}`, { state: { refresh: true } })}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 w-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-gray-700">Subscription Plans</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate("/dashboard/subscriptions/create", { state: { refresh: true } })}
                >
                    Add Plan
                </Button>
            </div>

            {loading ? (
                <Spin fullscreen />
            ) : (
                <Table
                    columns={columns}
                    dataSource={plans}
                    rowKey="id"
                    pagination={{
                        current: page,
                        total: totalElements,
                        pageSize: 10,
                        onChange: (p) => setPage(p),
                    }}
                    bordered
                    rowClassName={(_, index) =>
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }
                    scroll={{ x: "max-content" }}
                />
            )}

            {/* View Modal */}
            <Modal
                open={viewModal}
                onCancel={() => setViewModal(false)}
                footer={null}
                title="Subscription Plan Details"
                width={700}
            >
                {singlePlan ? (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Name">{singlePlan.name}</Descriptions.Item>
                        <Descriptions.Item label="Description">{singlePlan.description}</Descriptions.Item>
                        <Descriptions.Item label="Type">{singlePlan.type}</Descriptions.Item>
                        <Descriptions.Item label="Price">₹{singlePlan.price}</Descriptions.Item>
                        <Descriptions.Item label="Marketing Fee">₹{singlePlan.marketingFee}</Descriptions.Item>
                        <Descriptions.Item label="Duration Days">{singlePlan.durationDays}</Descriptions.Item>
                        <Descriptions.Item label="Max Properties">{singlePlan.maxProperties}</Descriptions.Item>
                        <Descriptions.Item label="Max Reels Per Property">{singlePlan.maxReelsPerProperty}</Descriptions.Item>
                        <Descriptions.Item label="Max Total Reels">{singlePlan.maxTotalReels}</Descriptions.Item>
                        <Descriptions.Item label="Hide Content After Days">{singlePlan.contentHideAfterDays}</Descriptions.Item>
                        <Descriptions.Item label="Delete Content After Days">{singlePlan.contentDeleteAfterDays}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={singlePlan.active ? "green" : "red"}>
                                {singlePlan.active ? "Active" : "Inactive"}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                ) : (
                    <Spin />
                )}
            </Modal>
        </div>
    );
};

export default SubscriptionPlansListPage;
