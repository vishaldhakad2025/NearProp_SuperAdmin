import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Modal, Spin } from "antd";
import { Eye } from "lucide-react";
import {
  approveFranchiseeRequest,
  rejectFranchiseeRequest,
  fetchFranchiseeRequestsByStatus,
} from "../../redux/slices/franchiseeSlice";
import { toast } from "react-toastify";

const PendingFranchisees = () => {
  const dispatch = useDispatch();
  const { pendingRequests, totalElements, loading } = useSelector(
    (state) => state.franchisee
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // ✅ Approve/Reject Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // ✅ Details Modal
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    dispatch(
      fetchFranchiseeRequestsByStatus({
        status: "PENDING",
        page: currentPage,
        size: pageSize,
        sortBy: "createdAt",
        direction: "DESC",
      })
    );
  }, [dispatch, currentPage, pageSize]);

  const handleAction = (id, type) => {
    setSelectedId(id);
    setActionType(type);
    setModalVisible(true);
  };

  const confirmAction = async () => {
    try {
      if (actionType === "approve") {
        await dispatch(
          approveFranchiseeRequest({ id: selectedId })
        ).unwrap();
        toast.success("Request Approved");
      } else {
        await dispatch(
          rejectFranchiseeRequest({ id: selectedId })
        ).unwrap();
        toast.success("Request Rejected");
      }

      setModalVisible(false);

      dispatch(
        fetchFranchiseeRequestsByStatus({
          status: "PENDING",
          page: currentPage,
          size: pageSize,
        })
      );
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Action failed";
      toast.error(errorMsg);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Business Name", dataIndex: "businessName" },
    { title: "Contact Email", dataIndex: "contactEmail" },
    { title: "Phone", dataIndex: "contactPhone" },
    { title: "District", dataIndex: "districtName" },
    { title: "State", dataIndex: "state" },
    { title: "GST", dataIndex: "gstNumber" },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button
            icon={<Eye size={18} />}
            onClick={() => {
              setSelectedRecord(record);
              setDetailsVisible(true);
            }}
          />
          <Button
            onClick={() => handleAction(record.id, "approve")}
            type="primary"
            className="bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Approve
          </Button>
          <Button
            onClick={() => handleAction(record.id, "reject")}
            danger
            className="rounded-lg"
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">
          Pending Franchisee Requests
        </h2>

        <Spin spinning={loading}>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={pendingRequests}
              rowKey="id"
              scroll={{ x: "max-content" }}
              pagination={{
                current: currentPage + 1,
                pageSize,
                total: totalElements,
                onChange: (page, size) => {
                  setCurrentPage(page - 1);
                  setPageSize(size);
                },
              }}
            />
          </div>
        </Spin>
      </div>

      {/* ✅ Approve/Reject Confirmation */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={confirmAction}
        okText={actionType === "approve" ? "Approve" : "Reject"}
        okButtonProps={{
          className:
            actionType === "approve"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700",
        }}
        title={
          actionType === "approve" ? "Approve Franchisee" : "Reject Franchisee"
        }
      >
        <p className="text-gray-700">
          Are you sure you want to{" "}
          <span className="font-semibold">{actionType}</span> this request?
        </p>
      </Modal>

      {/* ✅ Franchisee Details Modal */}
      <Modal
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailsVisible(false)}>
            Back
          </Button>,
        ]}
        title="Franchisee Request Details"
        width={800}
      >
        {selectedRecord && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>ID:</strong> {selectedRecord.id}
            </p>
            <p>
              <strong>Name:</strong> {selectedRecord.user?.name}
            </p>
            <p>
              <strong>Phone:</strong> {selectedRecord.user?.phone}
            </p>
            <p>
              <strong>Email:</strong> {selectedRecord.contactEmail}
            </p>
            <p>
              <strong>Business Name:</strong> {selectedRecord.businessName}
            </p>
            <p className="md:col-span-2">
              <strong>Business Address:</strong>{" "}
              {selectedRecord.businessAddress}
            </p>
            <p>
              <strong>District:</strong> {selectedRecord.districtName}
            </p>
            <p>
              <strong>State:</strong> {selectedRecord.state}
            </p>
            <p>
              <strong>GST:</strong> {selectedRecord.gstNumber}
            </p>
            <p>
              <strong>PAN:</strong> {selectedRecord.panNumber}
            </p>
            <p>
              <strong>Aadhar:</strong> {selectedRecord.aadharNumber}
            </p>
            <p>
              <strong>Experience:</strong> {selectedRecord.yearsOfExperience} years
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(selectedRecord.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {new Date(selectedRecord.updatedAt).toLocaleString()}
            </p>
            <div className="md:col-span-2">
              <strong>Documents:</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                {selectedRecord.documentUrls?.map((url, idx) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Document {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingFranchisees;
