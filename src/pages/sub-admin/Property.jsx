// src/pages/PropertyList.jsx
import React, { useEffect, useState } from "react";
import {
    Card,
    Table,
    Spin,
    Space,
    Typography,
    message,
    Button,
    Row,
    Col,
    Alert,
} from "antd";
import { Avatar } from "antd";
import { UserOutlined, ReloadOutlined, CheckOutlined, CloseOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";   // ← यह लाइन जोड़ो
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

import { BASE_URL } from "../../utils/axiosInstance";

const { Title, Text } = Typography;

const PropertyListss = () => {  // Fixed component name from PropertyListss to PropertyList
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [token, setToken] = useState(null);  // State for token to ensure it's fetched properly
    const navigate = useNavigate();   // ← यह लाइन जोड़ो (सबसे ऊपर)
    // Fetch token from localStorage once on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("subAdminToken");
        if (storedToken) {
            setToken(storedToken);
        } else {
            message.error("No authentication token found. Please log in.");
        }
    }, []);

    // Fetch properties (now accepts page and size dynamically)
    const fetchProperties = async (page = 0, size = 10) => {
        if (!token) {
            message.error("Authentication required. Token not found.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/api/admin/permissions/admin/pending?page=${page}&size=${size}&sort=submittedAt,desc`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProperties(response.data.content || []);
            setCurrentPage(response.data.pageable.pageNumber);
            setPageSize(response.data.pageable.pageSize);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error(err);
            message.error("Failed to fetch properties");
        } finally {
            setLoading(false);
        }
    };

    // Approve handler
    const onApprove = async (id) => {
        if (!token) {
            message.error("Authentication required.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/api/admin/permissions/admin/review`,
                {
                    requestId: id,
                    approved: true,
                    reviewerType: "SUBADMIN",
                    notes: "Approved from sub-admin side",
                    rejectionReason: null
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Property approved successfully");
            fetchProperties(currentPage, pageSize);  // Refresh list after action
        } catch (err) {
            console.error(err);
            message.error("Failed to approve property");
        } finally {
            setLoading(false);
        }
    };

    // Reject handler
    const onReject = async (id) => {
        if (!token) {
            message.error("Authentication required.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/api/admin/permissions/admin/review`,
                {
                    requestId: id,
                    approved: false,
                    reviewerType: "SUBADMIN",
                    notes: "Rejected from sub-admin side",
                    rejectionReason: "The property details violate platform guidelines. Please revise and resubmit."
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Property rejected successfully");
            fetchProperties(currentPage, pageSize);  // Refresh list after action
        } catch (err) {
            console.error(err);
            message.error("Failed to reject property");
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount (only if token exists)
    useEffect(() => {
        if (token) {
            fetchProperties();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Property Title", dataIndex: "propertyTitle", key: "propertyTitle" },
        {
            title: "Requested By",
            key: "requestedBy",
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Avatar
                        icon={<UserOutlined />}
                        src={record.requestedBy?.profileImage} // optional, if you have image
                    />
                    <div>
                        <div><strong>Name:</strong> {record.requestedBy?.name || "-"}</div>
                        <div><strong>Number:</strong> {record.requestedBy?.phone || "-"}</div>
                    </div>
                </div>
            ),
        },
        { title: "District", dataIndex: "district", key: "district" },
        {
            title: "Submitted At",
            dataIndex: "submittedAt",
            key: "submittedAt",
            render: (text) => text ? dayjs(text).format("DD-MM-YYYY HH:mm:ss") : "-",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => onApprove(record.id)}
                        loading={loading}
                    >
                        Approve
                    </Button>
                    <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => onReject(record.id)}
                        loading={loading}
                    >
                        Reject
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 32, background: '#f0f2f5', minHeight: '100vh' }}>
            <div style={{ marginBottom: 24 }}>
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<ArrowLeftOutlined style={{ fontSize: 18 }} />}
                    onClick={() => navigate("/subadmins")}  // ← यह लाइन जोड़ो
                    style={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                        border: 'none',
                        boxShadow: '0 6px 16px rgba(24, 144, 255, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    className="back-button-hover"
                />

                {/* Optional: Text के साथ चाहो तो ये भी use कर सकते हो */}
                {/* <span style={{ marginLeft: 12, fontSize: 16, color: '#1890ff', fontWeight: 500 }}>
      Back
    </span> */}
            </div>
            <Card
                headStyle={{ borderBottom: 'none', padding: '24px 32px' }}
                bodyStyle={{ padding: '32px' }}
                style={{
                    borderRadius: 16,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    background: '#fff',
                    overflow: 'hidden',
                }}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size={16}>
                            <div style={{
                                width: 56,
                                height: 56,
                                background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                                borderRadius: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                            }}>
                                <UserOutlined style={{ fontSize: 28, color: '#fff' }} />
                            </div>
                            <div>
                                <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>Property Update Request List</Title>
                                <Text type="secondary" style={{ fontSize: 14 }}>View and manage pending properties</Text>
                            </div>
                        </Space>
                        <Button
                            icon={<ReloadOutlined />}
                            size="large"
                            onClick={() => fetchProperties(currentPage, pageSize)}
                        >
                            Refresh
                        </Button>
                    </div>
                }
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <Spin size="large" tip="Loading properties..." />
                    </div>
                ) : properties.length === 0 ? (
                    <Alert
                        message="No Properties Found"
                        description="There are no pending properties at the moment. Check back later or refresh."
                        type="info"
                        showIcon
                        style={{ margin: '20px 0' }}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={properties}
                        rowKey="id"
                        pagination={{
                            current: currentPage + 1,
                            pageSize,
                            total: totalElements,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            onChange: (page, size) => {
                                setCurrentPage(page - 1);
                                setPageSize(size);
                                fetchProperties(page - 1, size);
                            },
                        }}
                        bordered={false}
                        rowClassName="editable-row"
                        style={{ marginTop: 8 }}
                    />
                )}
            </Card>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default PropertyListss;