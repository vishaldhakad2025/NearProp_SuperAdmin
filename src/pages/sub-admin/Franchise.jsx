// src/pages/FranchiseList.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Spin,
  Typography,
  message,
  Space,
  Modal,
  Input,
  Tag,
  Avatar,
  Empty,
  Alert,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  UserOutlined,
  ArrowLeftOutlined ,
  ShopOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";   // ← यह लाइन जोड़ो

import { BASE_URL } from "../../utils/axiosInstance";

const { Title, Text } = Typography;
const { TextArea } = Input;

const FranchiseList = () => {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
const navigate = useNavigate();   // ← यह जोड़ा
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Reject Modal
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState(null);
  const [comment, setComment] = useState("");

  // Smart Token Getter (सभी संभावित नामों से लेगा)
  const getToken = () => {
    return (
      localStorage.getItem("subAdminToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt") ||
      ""
    );
  };

  // Load token on mount
  useEffect(() => {
    const savedToken = getToken();
    if (!savedToken) {
      message.error("Please login again");
    } else {
      setToken(savedToken);
    }
  }, []);

  // Fetch Franchises
  const fetchFranchises = async (page = 0, size = 10) => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/permissions/franchisee/status/PENDING?page=${page}&size=${size}&sort=createdAt,desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;
      setFranchises(data.content || []);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(data.pageable?.pageNumber || 0);
      setPageSize(data.pageable?.pageSize || 10);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        message.error("Session expired. Redirecting to login...");
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/login";
        }, 1500);
      } else {
        message.error("Failed to load franchise requests");
      }
    } finally {
      setLoading(false);
    }
  };

  // Approve
  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/api/admin/permissions/franchisee/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Franchise approved successfully!");
      fetchFranchises(currentPage, pageSize);
    } catch (err) {
      message.error("Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  // Reject with Comment
 // Reject with Comment + Error Toast
const handleReject = async () => {
  if (!comment.trim()) {
    toast.warning("Please provide a reason for rejection");
    return;
  }

  setLoading(true);
  try {
    await axios.put(
      `${BASE_URL}/api/admin/permissions/franchisee/${selectedFranchiseId}/reject?comments=${encodeURIComponent(comment.trim())}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Franchise rejected successfully");
    setCommentModalVisible(false);
    setComment("");
    setSelectedFranchiseId(null);
    fetchFranchises(currentPage, pageSize);
  } catch (err) {
    const errorMsg = err.response?.data?.error?.message 
      || err.response?.data?.message 
      || "Failed to reject application";

    toast.error(errorMsg);   // अब error toast में आएगा
  } finally {
    setLoading(false);
  }
};

  // Load on mount
  useEffect(() => {
    if (token) fetchFranchises();
  }, [token]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      fixed: "left",
    },
    {
      title: "Franchise Owner",
      key: "owner",
      render: (_, record) => (
        <Space>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            src={record.user?.profileImage}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <Text strong>{record.user?.name || "N/A"}</Text>
            <br />
            <Text type="secondary">{record.user?.phone || "N/A"}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Business Name",
      dataIndex: "businessName",
      key: "businessName",
      render: (text) => <Text strong>{text || "-"}</Text>,
    },
    {
      title: "Contact Email",
      dataIndex: "contactEmail",
      key: "contactEmail",
    },
    {
      title: "Status",
      key: "status",
      render: () => (
        <Tag color="orange" icon={<ShopOutlined />}>
          Pending Review
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            size="middle"
            onClick={() => handleApprove(record.id)}
            loading={loading}
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            size="middle"
            onClick={() => {
              setSelectedFranchiseId(record.id);
              setCommentModalVisible(true);
            }}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 32,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
        <div style={{ marginBottom: 24 }}>
  <Button
    type="primary"
    shape="circle"
    size="large"
    icon={<ArrowLeftOutlined style={{ fontSize: 18 }} />}
    onClick={() => navigate(-1)}  // पिछले पेज पर वापस जाएगा
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
      {/* Premium Card */}
      <Card
        headStyle={{ border: "none", padding: "24px 32px" }}
        bodyStyle={{ padding: "32px" }}
        style={{
          borderRadius: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          background: "#fff",
          overflow: "hidden",
        }}
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space size={18}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "linear-gradient(135deg, #52c41a, #389e0d)",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(82,196,26,0.3)",
                }}
              >
                <ShopOutlined style={{ fontSize: 32, color: "#fff" }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, color: "#1a1a1a" }}>
                  Franchise Applications
                </Title>
                <Text type="secondary" style={{ fontSize: 15 }}>
                  Review and manage incoming franchise requests
                </Text>
              </div>
            </Space>

            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => fetchFranchises(currentPage, pageSize)}
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 15px rgba(24,144,255,0.3)",
              }}
            >
              Refresh List
            </Button>
          </div>
        }
      >
        {/* Loading State */}
        {loading && !franchises.length ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Spin size="large" tip="Loading franchise requests..." />
          </div>
        ) : franchises.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text strong style={{ fontSize: 16, color: "#666" }}>
                No pending franchise applications
              </Text>
            }
            style={{ margin: "60px 0" }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={franchises}
            rowKey="id"
            // scroll={{ x: 1000 }}
            pagination={{
              current: currentPage + 1,
              pageSize,
              total: totalElements,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (page, size) => {
                setCurrentPage(page - 1);
                setPageSize(size || 10);
                fetchFranchises(page - 1, size);
              },
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} requests`,
            }}
            rowClassName={() => "hover-row"}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {/* Reject Modal with Premium Look */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />
            <Text strong style={{ fontSize: 18 }}>
              Reject Franchise Application
            </Text>
          </Space>
        }
        open={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false);
          setComment("");
        }}
        onOk={handleReject}
        okText="Reject Application"
        okButtonProps={{ danger: true, loading }}
        cancelText="Cancel"
        width={520}
        centered
      >
        <Alert
          message="This action will notify the applicant with your reason."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Text strong>Rejection Reason *</Text>
        <TextArea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Please explain why this application is being rejected..."
          style={{ marginTop: 8, borderRadius: 10 }}
        />
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default FranchiseList;