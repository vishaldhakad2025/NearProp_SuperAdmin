import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNearbyReels,
  deleteReel,
  likeReel,
  unlikeReel,
} from "../../redux/slices/reelsSlice";
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Tooltip,
  Spin,
  Tabs,
  Modal,
  Input,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  LikeOutlined,
  DislikeOutlined,
  VideoCameraOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toastError, toastSuccess } from "../../utils/toast";

const { TextArea } = Input;

const ReelManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reels: reduxReels, loading } = useSelector((state) => state.reels);

  const [activeTab, setActiveTab] = useState("pending");
  const [pendingReels, setPendingReels] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [rejectModal, setRejectModal] = useState({
    visible: false,
    id: null,
    reason: "",
  });
  const [viewModal, setViewModal] = useState({
    visible: false,
    data: null,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch all pending reels (admin only)
  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://api.nearprop.com/api/reels/admin/pending", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pending reels");

      const responseData = await response.json();
      let dataArray = [];
      if (responseData?.data?.content) {
        dataArray = Array.isArray(responseData.data.content) ? responseData.data.content : [];
      } else if (Array.isArray(responseData)) {
        dataArray = responseData;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        dataArray = responseData.data;
      }
      setPendingReels(dataArray);
    } catch (err) {
      toastError("Failed to fetch pending reels");
      setPendingReels([]);
    } finally {
      setLoadingPending(false);
    }
  };

  // Main effect: Load data based on tab
  useEffect(() => {
    if (activeTab === "pending") {
      if (pendingReels.length === 0) {
        fetchPending();
      }
    } else {
      dispatch(
        fetchNearbyReels({
          radiusKm: 50,
          latitude: 20.7749,
          longitude: 75.459,
        })
      );
    }
  }, [activeTab, dispatch]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://api.nearprop.com/api/reels/admin/${id}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!response.ok) throw new Error("Failed to approve");
      toastSuccess("Reel approved successfully");
      fetchPending();
    } catch (err) {
      toastError("Failed to approve reel");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://api.nearprop.com/api/reels/admin/${id}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REJECTED", reason }),
      });
      if (!response.ok) throw new Error("Failed to reject");
      toastSuccess("Reel rejected successfully");
      setRejectModal({ visible: false, id: null, reason: "" });
      fetchPending();
    } catch (err) {
      toastError("Failed to reject reel");
    }
  };

  const showRejectModal = (id) => {
    setRejectModal({ visible: true, id, reason: "" });
  };

  const handleRejectOk = () => {
    if (!rejectModal.reason.trim()) {
      toastError("Please provide a reason for rejection");
      return;
    }
    handleReject(rejectModal.id, rejectModal.reason);
  };

  const handleRejectCancel = () => {
    setRejectModal({ visible: false, id: null, reason: "" });
  };

  const handleReasonChange = (e) => {
    setRejectModal((prev) => ({ ...prev, reason: e.target.value }));
  };

  const handleDelete = (id) => {
    dispatch(deleteReel(id))
      .unwrap()
      .then(() => {
        toastSuccess("Reel deleted successfully");
      })
      .catch(() => toastError("Failed to delete reel"));
  };

  const handleLikeToggle = (reel) => {
    if (reel.liked) {
      dispatch(unlikeReel(reel.id));
    } else {
      dispatch(likeReel(reel.id));
    }
  };

  const handleView = (record) => {
    console.log("Viewing reel data:", record); // Debug: Check if videoUrl is present and valid
    setViewModal({ visible: true, data: record });
  };

  const handleViewClose = () => {
    setViewModal({ visible: false, data: null });
  };

  const baseColumns = [
    {
      title: "Video",
      dataIndex: "videoUrl",
      key: "videoUrl",
      render: (_, record) => (
        <div className="flex justify-center">
          {record.videoUrl ? (
            <video
              src={record.videoUrl}
              controls={false}
              muted
              className="w-28 h-24 sm:w-32 sm:h-24 object-cover rounded-lg shadow"
            />
          ) : (
            <VideoCameraOutlined className="text-2xl text-gray-400" />
          )}
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span className="text-gray-800 text-sm sm:text-base font-medium">
          {text || "No title"}
        </span>
      ),
      responsive: ["sm", "md", "lg"],
    },
    {
      title: "Views",
      dataIndex: "viewCount",
      key: "viewCount",
      render: (count) => <Tag color="blue">{count || 0} Views</Tag>,
      responsive: ["sm", "md", "lg"],
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString() : "Not available",
      responsive: ["md", "lg"],
    },
  ];

  const pendingActionsColumn = {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space size="middle" className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-0">
        <Tooltip title="View Reel">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
        </Tooltip>
        <Popconfirm
          title="Are you sure you want to approve this reel?"
          onConfirm={() => handleApprove(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" icon={<CheckOutlined className="text-green-500" />}>
            Approve
          </Button>
        </Popconfirm>
        <Tooltip title="Reject Reel">
          <Button
            type="link"
            danger
            icon={<CloseOutlined />}
            onClick={() => showRejectModal(record.id)}
          >
            Reject
          </Button>
        </Tooltip>
      </Space>
    ),
  };

  const allActionsColumn = {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space size="middle" className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-0">
        <Tooltip title="View Reel">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
        </Tooltip>
        {/* <Tooltip title={record.liked ? "Unlike Reel" : "Like Reel"}>
          <Button
            type="link"
            onClick={() => handleLikeToggle(record)}
            icon={
              record.liked ? (
                <DislikeOutlined className="text-red-500" />
              ) : (
                <LikeOutlined className="text-green-500" />
              )
            }
          >
            {record.liked ? "Unlike" : "Like"}
          </Button>
        </Tooltip> */}
        <Popconfirm
          title="Are you sure you want to delete this reel?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="link" icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      </Space>
    ),
  };

  const pendingColumns = [...baseColumns, pendingActionsColumn];
  const allColumns = [...baseColumns, allActionsColumn];

  const safePendingReels = Array.isArray(pendingReels) ? pendingReels : [];
  const safeReduxReels = Array.isArray(reduxReels) ? reduxReels : [];
  let currentData = activeTab === "pending" ? safePendingReels : safeReduxReels;
  const currentLoading = activeTab === "pending" ? loadingPending : loading;
  const currentColumns = activeTab === "pending" ? pendingColumns : allColumns;

  // Client-side pagination
  const paginatedData = currentData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const total = currentData.length;

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
        🎬 Reel Management
      </h2>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "pending", label: "Pending Reels" },
          { key: "all", label: "All Reels" },
        ]}
        className="mb-4"
      />

      <div className="bg-[#f5f5f5c5] rounded-md mt-3">
        {currentLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={paginatedData}
            columns={currentColumns}
            rowKey={(record) => record.id || Math.random()}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ["50", "100", "150"],
              onChange: (p, size) => {
                setPage(p);
                if (size) setPageSize(size);
              },
              onShowSizeChange: (current, size) => {
                setPageSize(size);
                setPage(1);
              },
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} reels`,
            }}
            bordered
            scroll={{ x: "max-content" }}
            onChange={handleTableChange}
          />
        )}
      </div>

      {/* View Modal */}
      <Modal
        title="Reel Details"
        open={viewModal.visible}
        onCancel={handleViewClose}
        footer={null}
        width={900}
      >
        {viewModal.data ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              {viewModal.data.videoUrl ? (
                <video
                  src={viewModal.data.videoUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full max-w-2xl h-96 object-contain rounded-lg shadow-lg"
                  preload="metadata"
                  onError={(e) => {
                    console.error("Video load error:", e);
                    toastError("Failed to load video. Check console for details.");
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <VideoCameraOutlined className="text-6xl text-gray-400 mb-2" />
                  <p className="text-gray-500">No video available</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Left Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Title: {viewModal.data.title || "No title"}
                </h3>

                <p className="text-sm text-gray-600 mb-1">
                  <strong>Views:</strong> {viewModal.data.viewCount || 0}
                </p>

                <p className="text-sm text-gray-600 mb-1">
                  <strong>Likes:</strong> {viewModal.data.likeCount || 0}
                </p>

                <p className="text-sm text-gray-600 mb-1">
                  <strong>Created:</strong>{" "}
                  {viewModal.data.createdAt
                    ? new Date(viewModal.data.createdAt).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>

              {/* Right Section */}
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Status:</strong>{" "}
                  <Tag
                    color={
                      viewModal.data.status === "APPROVED"
                        ? "green"
                        : viewModal.data.status === "REJECTED"
                          ? "red"
                          : "orange"
                    }
                  >
                    {viewModal.data.status || "Pending"}
                  </Tag>
                </p>

                {/* OWNER DETAILS */}
                {viewModal.data.owner && (
                  <div className="mt-3 border-t pt-3">
                    <h4 className="font-semibold mb-2">Owner Details</h4>

                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={viewModal.data.owner.profileImageUrl}
                        alt="Owner"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {viewModal.data.owner.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {viewModal.data.owner.email}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Mobile:</strong> {viewModal.data.owner.mobileNumber}
                    </p>

                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Roles:</strong>{" "}
                      {viewModal.data.owner.roles?.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        )}
      </Modal>

      <Modal
        title="Reject Reason"
        open={rejectModal.visible}
        onOk={handleRejectOk}
        onCancel={handleRejectCancel}
        okText="Reject"
        cancelText="Cancel"
      >
        <TextArea
          value={rejectModal.reason}
          onChange={handleReasonChange}
          placeholder="Enter reason for rejection"
          rows={4}
          maxLength={500}
        />
      </Modal>
    </div>
  );
};

export default ReelManagement;