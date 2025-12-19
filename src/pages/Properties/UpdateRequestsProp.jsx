import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Avatar, Tag, Tooltip, Input, Space } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingPropertyUpdates,
  reviewPropertyUpdate,
} from "../../redux/slices/propertyUpdateSlice";

const { TextArea } = Input;

const PropertyUpdateRequests = () => {
  const dispatch = useDispatch();
  const { updates, loading, total } = useSelector((state) => state.propertyUpdates);

  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [current, setCurrent] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(getPendingPropertyUpdates({ page: page - 1, size: 10 }));
  }, [dispatch, page]);

  const handleSubmitReview = () => {
    if (!current) return;
    const payload = {
      requestId: current.id,
      approved: actionType === "approve",
      reviewerType: "ADMIN",
      notes: notes || (actionType === "approve" ? "Approved by admin" : "Rejected"),
      rejectionReason: actionType === "reject" ? reason : null,
    };
    dispatch(reviewPropertyUpdate(payload));
    setModalVisible(false);
    setNotes("");
    setReason("");
    setCurrent(null);
  };

  const openModal = (record, type = "view") => {
    setCurrent(record);
    setActionType(type);
    setModalVisible(true);
  };

  const filteredUpdates = updates?.filter(
    (u) =>
      u.propertyTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      u.requestedBy?.name.toLowerCase().includes(searchText.toLowerCase()) ||
      u.requestedBy?.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Property Title",
      dataIndex: "propertyTitle",
      key: "propertyTitle",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Requested By",
      dataIndex: "requestedBy",
      key: "requestedBy",
      render: (user) => (
        <Space>
          <Avatar src={user.profileImageUrl} />
          <div>
            <p className="m-0 font-medium">{user.name}</p>
            <span className="text-xs text-gray-500">{user.phone}</span>
          </div>
        </Space>
      ),
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Submitted At",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => openModal(record, "view")}
            />
          </Tooltip>
          <Tooltip title="Approve">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => openModal(record, "approve")}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              onClick={() => openModal(record, "reject")}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {/* 🔍 Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Pending Property Updates</h2>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search property / user..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-64"
        />
      </div>

      {/* 📋 Table */}
      <Table
        dataSource={filteredUpdates}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: (p) => setPage(p),
        }}
        scroll={{ x: 900 }}
      />

      {/* 👁️ Details Modal */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmitReview}
        okText={
          actionType === "approve"
            ? "Approve"
            : actionType === "reject"
            ? "Reject"
            : "Close"
        }
        okButtonProps={{
          danger: actionType === "reject",
        }}
        cancelButtonProps={{
          style: { display: actionType === "view" ? "none" : "inline-block" },
        }}
        width={800}
        className="max-w-4xl"
        title={
          actionType === "approve"
            ? "Approve Property Update"
            : actionType === "reject"
            ? "Reject Property Update"
            : "Property Update Details"
        }
      >
        {current && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Property:</h4>
                <p>{current.propertyTitle}</p>
                <p className="text-sm text-gray-500">#{current.propertyPermanentId}</p>
              </div>
              <div>
                <h4 className="font-semibold">Requested By:</h4>
                <p>{current.requestedBy?.name}</p>
                <p className="text-sm text-gray-500">{current.requestedBy?.phone}</p>
              </div>
            </div>

            {/* 🔄 Old vs New Changes */}
            <div className="border rounded p-3 bg-gray-50 max-h-72 overflow-y-auto">
              <h4 className="font-semibold mb-2">Changes:</h4>
              {Object.entries(current.oldValues || {}).map(([key, oldVal]) => (
                <div key={key} className="mb-2 text-sm">
                  <strong>{key}:</strong>{" "}
                  <span className="text-red-500 line-through">{oldVal || "—"}</span>{" "}
                  <span className="text-green-600">→ {current.newValues[key]}</span>
                </div>
              ))}
            </div>

            {/* 📝 Notes + Reason */}
            {(actionType === "approve" || actionType === "reject") && (
              <div>
                <TextArea
                  rows={3}
                  placeholder="Enter notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {actionType === "reject" && (
                  <TextArea
                    rows={2}
                    placeholder="Enter rejection reason"
                    className="mt-2"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PropertyUpdateRequests;
