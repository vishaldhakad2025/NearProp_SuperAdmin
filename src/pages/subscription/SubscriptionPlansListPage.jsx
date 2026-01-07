

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
    Spin,
    Modal,
    Descriptions,
} from "antd";
import {
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    PoweroffOutlined,
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

    // Fetch plans
    const fetchPlans = () => {
        dispatch(getAllSubscriptionPlans({ page: page - 1, size: 10 }));
    };

    useEffect(() => {
        fetchPlans();
    }, [dispatch, page]);

    // Auto-refresh after create/edit
    useEffect(() => {
        if (location.state?.refresh) {
            fetchPlans();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    // Toggle Activate/Deactivate with confirmation
    const confirmToggle = (record) => {
        const willBeActive = !record.active;
        const actionText = willBeActive ? "activate" : "deactivate";

        Swal.fire({
            title: `${willBeActive ? "Activate" : "Deactivate"} this plan?`,
            text: `Are you sure you want to ${actionText} the "${record.name}" plan?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Yes, ${willBeActive ? "Activate" : "Deactivate"}`,
            cancelButtonText: "Cancel",
            confirmButtonColor: willBeActive ? "#3085d6" : "#d33",
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(toggleSubscriptionPlanStatus({ planId: record.id, active: record.active }))
                    .unwrap()
                    .then(() => {
                        fetchPlans();
                        Swal.fire(
                            "Success!",
                            `Plan has been ${actionText}d successfully.`,
                            "success"
                        );
                    })
                    .catch((error) => {
                        console.error("Toggle status failed:", error);
                        // Error toast already handled in thunk
                    });
            }
        });
    };

    // Delete with confirmation
    const confirmDelete = (record) => {
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
                    .unwrap()
                    .then(() => {
                        fetchPlans();
                        Swal.fire(
                            "Deleted!",
                            "Your plan has been deleted.",
                            "success"
                        );
                    })
                    .catch((error) => {
                        console.error("Delete failed:", error);
                        // Error toast already handled in thunk
                    });
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
            render: (val) => `₹${val?.toLocaleString() || 0}`,
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
            render: (active) => (
                <Tag color={active ? "green" : "red"}>
                    {active ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record.id)}
                        />
                    </Tooltip>

                    <Tooltip title="Edit Plan">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() =>
                                navigate(`/dashboard/subscription/edit/${record.id}`, {
                                    state: { refresh: true },
                                })
                            }
                        />
                    </Tooltip>

                    <Tooltip title={record.active ? "Deactivate Plan" : "Activate Plan"}>
                        <Button
                            type={record.active ? "default" : "primary"}
                            danger={record.active}
                            icon={<PoweroffOutlined />}
                            onClick={() => confirmToggle(record)}
                        >
                            {record.active ? "Deactivate" : "Activate"}
                        </Button>
                    </Tooltip>

                    <Tooltip title="Delete Plan">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => confirmDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 w-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Subscription Plans</h2>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() =>
                        navigate("/dashboard/subscriptions/create", {
                            state: { refresh: true },
                        })
                    }
                >
                    Add New Plan
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={plans}
                    rowKey="id"
                    pagination={{
                        current: page,
                        pageSize: 10,
                        total: totalElements,
                        showSizeChanger: false,
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
                width={800}
            >
                {singlePlan ? (
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="Name">{singlePlan.name}</Descriptions.Item>
                        <Descriptions.Item label="Description">
                            {singlePlan.description || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Type">
                            <Tag color={singlePlan.type === "SELLER" ? "blue" : "purple"}>
                                {singlePlan.type}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Price">
                            ₹{singlePlan.price?.toLocaleString() || 0}
                        </Descriptions.Item>
                        {/* <Descriptions.Item label="Marketing Fee">
                            ₹{singlePlan.marketingFee?.toLocaleString() || 0}
                        </Descriptions.Item> */}
                        <Descriptions.Item label="Duration (Days)">
                            {singlePlan.durationDays}
                        </Descriptions.Item>
                        <Descriptions.Item label="Max Properties">
                            {singlePlan.maxProperties}
                        </Descriptions.Item>
                        <Descriptions.Item label="Max Reels Per Property">
                            {singlePlan.maxReelsPerProperty || "Unlimited"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Max Total Reels">
                            {singlePlan.maxTotalReels || "Unlimited"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hide Content After Days">
                            {singlePlan.contentHideAfterDays || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Delete Content After Days">
                            {singlePlan.contentDeleteAfterDays || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={singlePlan.active ? "green" : "red"}>
                                {singlePlan.active ? "Active" : "Inactive"}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                ) : (
                    <div className="flex justify-center py-8">
                        <Spin />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SubscriptionPlansListPage;