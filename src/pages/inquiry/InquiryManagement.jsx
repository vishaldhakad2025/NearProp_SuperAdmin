import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Pagination,
  Modal,
  Button,
  Spin,
  message,
  Tag,
  Tooltip,
  Space,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInquiries,
  updateInquiryStatus,
} from "../../redux/slices/inquirySlice";
import {
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { exportToCSV, exportToPDF } from "../../utils/exportUtils";

const { Option } = Select;

const InquiryManagement = () => {
  const dispatch = useDispatch();
  const { inquiries, loading } = useSelector((state) => state.inquiry);

  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(fetchInquiries());
  }, [dispatch]);

  useEffect(() => {
    setFilteredInquiries(inquiries);
  }, [inquiries]);

  const handleSearch = (value) => {
    setSearch(value);
    const filtered = inquiries.filter((item) =>
      [item.name, item.email, item.area, item.city, item.propertyType]
        .join(" ")
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setFilteredInquiries(filtered);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    const filtered = value
      ? inquiries.filter((i) => i.status === value)
      : inquiries;
    setFilteredInquiries(filtered);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await dispatch(updateInquiryStatus({ inquiryId: id, status })).unwrap();
      message.success("Inquiry status updated successfully");
      setModalVisible(false);
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const statusColor = {
    IN_REVIEW: "blue",
    COMPLETED: "green",
    OTHER: "orange",
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"],
    },
    {
      title: "Mobile",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      responsive: ["md"],
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
  title: "Type",
  dataIndex: "propertyType",
  key: "propertyType",
  render: (type, record) => (
    <div className="flex flex-col gap-2 justify-start">
      <Tag color="purple" className="uppercase font-semibold">{type}</Tag>
      <Tag color="blue" className="uppercase font-semibold">{record.infoType}</Tag>
    </div>
  ),
},
    {
      title: "Size",
      dataIndex: "minSize",
      key: "minSize",
    },
    {
      title: "Max Price",
      dataIndex: "maxPrice",
      key: "maxPrice",
      render: (price) => `₹${price.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag color={statusColor[text] || "default"} className="capitalize">
          {text.toLowerCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="View / Update">
            <Button
              icon={<EyeOutlined />}
              type="primary"
              onClick={() => {
                setSelectedInquiry(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const paginatedData = filteredInquiries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-xl shadow-md  overflow-auto">


      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Inquiry Management
      </h1>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h2 className="text-lg font-bold">New Inquiries</h2>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(inquiries)} className="px-4 py-2 bg-blue-500 text-white rounded">Export CSV</button>
          {/* <button onClick={() => exportToPDF(inquiries, columns)} className="px-4 py-2 bg-red-500 text-white rounded">Export PDF</button> */}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input.Search
          placeholder="Search by name, email, area, type..."
          allowClear
          onSearch={handleSearch}
          className="w-full sm:w-72"
        />
        <Select
          placeholder="Filter by status"
          allowClear
          onChange={handleStatusFilter}
          className="w-full sm:w-60"
        >
          <Option value="IN_REVIEW">In Review</Option>
          <Option value="COMPLETED">Completed</Option>
          <Option value="OTHER">Other</Option>
        </Select>
      </div>

      <Spin spinning={loading} tip="Loading Inquiries...">
        <Table
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          rowKey="id"
          bordered
          rowClassName={(_, index) =>
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          }
          scroll={{ x: "100%" }}
        />
        <div className="mt-6 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredInquiries.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </Spin>

      <Modal
        open={modalVisible}
        title="Inquiry Details"
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedInquiry && (
          <div className="space-y-3 text-gray-700 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Name:</strong> {selectedInquiry.name}</p>
              <p><strong>Email:</strong> {selectedInquiry.email}</p>
              <p><strong>Mobile:</strong> {selectedInquiry.mobileNumber}</p>
              <p><strong>City:</strong> {selectedInquiry.city}</p>
              <p><strong>Area:</strong> {selectedInquiry.area}</p>
              <p><strong>Zip Code:</strong> {selectedInquiry.zipCode}</p>
              <p><strong>State:</strong> {selectedInquiry.state}</p>
              <p><strong>Bedrooms:</strong> {selectedInquiry.bedrooms}</p>
              <p><strong>Bathrooms:</strong> {selectedInquiry.bathrooms}</p>
              <p><strong>Min Size:</strong> {selectedInquiry.minSize}</p>
              <p><strong>Max Price:</strong> ₹{selectedInquiry.maxPrice?.toLocaleString()}</p>
              <p><strong>Property Type:</strong> {selectedInquiry.propertyType}</p>
            </div>
            <p><strong>Message:</strong> {selectedInquiry.message}</p>
            <div>
              <strong>Status History:</strong>
              <ul className="list-disc pl-5 mt-1">
                {selectedInquiry.statusHistory?.map((s, i) => (
                  <li key={i}>
                    <span className="font-medium">{s.status}</span> —{" "}
                    {s.comment} ({new Date(s.updatedAt).toLocaleString()})
                  </li>
                ))}
              </ul>
            </div>

            <Select
              placeholder="Update Status"
              className="w-full mt-4"
              defaultValue={selectedInquiry.status}
              onChange={(val) =>
                handleUpdateStatus(selectedInquiry.id, val)
              }
            >
              <Option value="IN_REVIEW">In Review</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="OTHER">Other</Option>
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InquiryManagement;
