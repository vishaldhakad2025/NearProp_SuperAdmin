import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Modal, Spin, Input, Form } from "antd";
import { Eye } from "lucide-react";
import { BiTrash } from "react-icons/bi";
import { toast } from "react-toastify";
import {
  fetchFranchiseeRequests,
  deleteFranchisee,
} from "../../redux/slices/franchiseeSlice";
import { format } from "date-fns";

const ActiveFranchisees = () => {
  const dispatch = useDispatch();
  const { requests, totalElements, loading } = useSelector(
    (state) => state.franchisee
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Details Modal
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Delete Modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  useEffect(() => {
    dispatch(
      fetchFranchiseeRequests({
        status: "ACTIVE",
        page: currentPage,
        size: pageSize,
        sortBy: "createdAt",
        direction: "DESC",
      })
    );
  }, [dispatch, currentPage, pageSize]);

  const confirmDelete = async () => {
    if (!deleteReason.trim()) {
      setReasonError(true);
      return;
    }
    console.log("Deleting franchisee ID:", selectedRecord, "Reason:", deleteReason);
    try {
      await dispatch(
        deleteFranchisee({ id: selectedRecord?.franchisee.id, reason: deleteReason ,districtId: selectedRecord?.districtId})
      ).unwrap();
      toast.success("Franchisee Deleted Successfully");
      setDeleteModalVisible(false);
      setDeleteReason("");
      setReasonError(false);

      // Refresh list
      dispatch(
        fetchFranchiseeRequests({
          status: "ACTIVE",
          page: currentPage,
          size: pageSize,
          sortBy: "createdAt",
          direction: "DESC",
        })
      );
    } catch (err) {
      toast.error("Failed to delete franchisee");
    }
  };

  const columns = [
    { title: "Request ID", dataIndex: "id", key: "id", width: 90 },
    { title: "Franchisee Name", dataIndex: ["franchisee", "name"], key: "name" },
    { title: "Franchisee Phone", dataIndex: ["franchisee", "phone"], key: "frPhone" },
    { title: "Contact Email", dataIndex: "contactEmail", key: "contactEmail" },
    { title: "Contact Phone", dataIndex: "contactPhone", key: "contactPhone" },
    { title: "State", dataIndex: "state", key: "state" },
    { title: "District", dataIndex: "districtName", key: "districtName" },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => (text ? format(new Date(text), "dd/MM/yyyy") : "-"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => (text ? format(new Date(text), "dd/MM/yyyy") : "-"),
    },
    {
      title: "Revenue %",
      dataIndex: "revenueSharePercentage",
      key: "revenue",
      render: (val) => `${val}%`,
    },
    { title: "Properties", dataIndex: "totalProperties", key: "totalProperties" },
    { title: "Revenue", dataIndex: "totalRevenue", key: "totalRevenue" },
    { title: "Commission", dataIndex: "totalCommission", key: "totalCommission" },
    {
      title: "Actions",
      key: "actions",
   
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            ghost
            icon={<Eye size={16} />}
            onClick={() => {
              setSelectedRecord(record);
              setDetailsVisible(true);
            }}
          >
            View
          </Button>
          <Button
            danger
            icon={<BiTrash />}
            onClick={() => {
              setSelectedRecord(record);
              setDeleteModalVisible(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full p-4 md:p-6 bg-white rounded-lg shadow-md">
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey={(record) => record.id}
          scroll={{ x: true }}
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
      </Spin>

      {/* Franchisee Details Modal */}
      <Modal
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
        ]}
        title="Franchisee Details"
        width={"80%"}
        style={{ top: 20 }}
      >
        {selectedRecord && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p><strong>Request ID:</strong> {selectedRecord.id}</p>
            <p><strong>Franchisee ID:</strong> {selectedRecord.franchisee?.id}</p>
            <p><strong>Name:</strong> {selectedRecord.franchisee?.name}</p>
            <p><strong>Phone:</strong> {selectedRecord.franchisee?.phone}</p>
            <p><strong>Contact Email:</strong> {selectedRecord.contactEmail}</p>
            <p><strong>Contact Phone:</strong> {selectedRecord.contactPhone}</p>
            <p><strong>Office Address:</strong> {selectedRecord.officeAddress}</p>
            <p><strong>District:</strong> {selectedRecord.districtName}</p>
            <p><strong>State:</strong> {selectedRecord.state}</p>
            <p><strong>Status:</strong> {selectedRecord.status}</p>
            <p>
              <strong>Start Date:</strong>{" "}
              {selectedRecord?.startDate ? format(new Date(selectedRecord.startDate), "dd/MM/yyyy") : "-"}
            </p>
            <p>
              <strong>End Date:</strong>{" "}
              {selectedRecord?.endDate ? format(new Date(selectedRecord.endDate), "dd/MM/yyyy") : "-"}
            </p>
            <p><strong>Revenue Share %:</strong> {selectedRecord.revenueSharePercentage}%</p>
            <p><strong>Total Properties:</strong> {selectedRecord.totalProperties}</p>
            <p><strong>Total Transactions:</strong> {selectedRecord.totalTransactions}</p>
            <p><strong>Total Revenue:</strong> {selectedRecord.totalRevenue}</p>
            <p><strong>Total Commission:</strong> {selectedRecord.totalCommission}</p>
            <p><strong>Created At:</strong> {new Date(selectedRecord.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(selectedRecord.updatedAt).toLocaleString()}</p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalVisible}
        title="Delete Franchisee"
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteReason("");
          setReasonError(false);
        }}
        onOk={confirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete franchisee{" "}
          <strong>{selectedRecord?.franchisee?.name}</strong>?
        </p>
        {/* {console.log("Deleting franchisee ID:", selectedRecord, "Reason:", deleteReason)} */}
        <Form layout="vertical">
          <Form.Item
            label="Reason for Deletion"
            validateStatus={reasonError ? "error" : ""}
            help={reasonError ? "Reason is required" : ""}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter reason for deletion"
              value={deleteReason}
              onChange={(e) => {
                setDeleteReason(e.target.value);
                setReasonError(false);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ActiveFranchisees;
