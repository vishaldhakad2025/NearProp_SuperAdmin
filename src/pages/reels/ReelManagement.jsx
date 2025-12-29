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
import ReelDetail from "./ReelDetail";
import { toastError, toastSuccess } from "../../utils/toast";

const { TextArea } = Input;

const ReelManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reels: reduxReels, loading } = useSelector((state) => state.reels);

  const [selectedReel, setSelectedReel] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingReels, setPendingReels] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [rejectModal, setRejectModal] = useState({
    visible: false,
    id: null,
    reason: "",
  });

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

  // SAME API for viewing any reel by ID (used in BOTH tabs)
  const fetchReelById = async (reelId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://api.nearprop.com/api/reels/${reelId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Reel not found or access denied");

      const reelData = await response.json();
      const reel = reelData.data || reelData; // Adjust based on your API response structure

      if (reel) {
        setSelectedReel(reel);
      } else {
        toastError("Reel not found");
      }
    } catch (err) {
      toastError("Failed to load reel details");
      // Don't fallback to list here — let normal loading happen
    }
  };

  // Main effect: Check URL for reelId and load it if present (works on both tabs)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reelIdFromUrl = urlParams.get("reelId");

    if (reelIdFromUrl && !selectedReel) {
      fetchReelById(reelIdFromUrl);
      return; // Skip normal list loading until we know if single reel loads
    }

    // Normal loading when no specific reel requested
    if (activeTab === "pending") {
      if (pendingReels.length === 0 && !selectedReel) {
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
  }, [activeTab, selectedReel, pendingReels.length, dispatch]);

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
      if (selectedReel?.id === id) setSelectedReel(null); // Optional: close detail if approved
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
      if (selectedReel?.id === id) setSelectedReel(null);
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
        if (selectedReel?.id === id) setSelectedReel(null);
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
            onClick={() => setSelectedReel(record)}
          />
        </Tooltip>
        <Tooltip title="Approve Reel">
          <Button
            type="link"
            icon={<CheckOutlined className="text-green-500" />}
            onClick={() => handleApprove(record.id)}
          />
        </Tooltip>
        <Tooltip title="Reject Reel">
          <Button
            type="link"
            danger
            icon={<CloseOutlined />}
            onClick={() => showRejectModal(record.id)}
          />
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
            onClick={() => setSelectedReel(record)}
          />
        </Tooltip>
        <Tooltip title={record.liked ? "Unlike Reel" : "Like Reel"}>
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
          />
        </Tooltip>
        <Popconfirm
          title="Are you sure to delete this reel?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="link" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  };

  const pendingColumns = [...baseColumns, pendingActionsColumn];
  const allColumns = [...baseColumns, allActionsColumn];

  const safePendingReels = Array.isArray(pendingReels) ? pendingReels : [];
  const safeReduxReels = Array.isArray(reduxReels) ? reduxReels : [];
  const currentData = activeTab === "pending" ? safePendingReels : safeReduxReels;
  const currentLoading = activeTab === "pending" ? loadingPending : loading;
  const currentColumns = activeTab === "pending" ? pendingColumns : allColumns;

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

      {!selectedReel ? (
        <div className="bg-[#f5f5f5c5] rounded-md mt-3">
          {currentLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={currentData}
              columns={currentColumns}
              rowKey={(record) => record.id || Math.random()}
              pagination={{ pageSize: 6, responsive: true }}
              bordered
              scroll={{ x: "max-content" }}
            />
          )}
        </div>
      ) : (
        <ReelDetail
          selectedReel={selectedReel}
          setSelectedReel={setSelectedReel}
          navigate={navigate}
        />
      )}

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