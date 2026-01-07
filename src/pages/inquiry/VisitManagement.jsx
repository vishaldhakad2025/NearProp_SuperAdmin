import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVisits, updateVisitStatus } from "../../redux/slices/visitsSlice";
import {
  Table,
  Tooltip,
  Button,
  Pagination,
  Modal,
  Tag,
  Input,
  Image,
  Descriptions,
  Divider,
  Row,
  Col,
  Select,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Search } = Input;
const { Option } = Select;

export default function VisitManagement() {
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { visits, loading } = useSelector((s) => s.visits);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const FETCH_SIZE = 10000;

  useEffect(() => {
    if (token) {
      dispatch(
        fetchVisits({
          page: 0,
          size: FETCH_SIZE,
          token,
        })
      );
    }
  }, [dispatch, token]);

  // Client-side filtering
  let filteredVisits = visits || [];
  if (search.trim()) {
    filteredVisits = filteredVisits.filter(
      (v) =>
        v.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.user?.phone?.toLowerCase().includes(search.toLowerCase()) ||
        v.property?.title?.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (statusFilter !== "ALL") {
    filteredVisits = filteredVisits.filter((v) => v.status === statusFilter);
  }

  // Client-side pagination
  const paginatedVisits = filteredVisits.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalFiltered = filteredVisits.length;

  const handleUpdate = (id, status) => {
    const notes = status === "CONFIRMED" ? "Visit confirmed by admin" : "Visit rejected by admin";

    dispatch(updateVisitStatus({ id, status, notes, token }))
      .unwrap()
      .then(() => {
        toast.success(`Visit ${status.toLowerCase()} successfully!`);
        // Refetch all data
        dispatch(
          fetchVisits({
            page: 0,
            size: FETCH_SIZE,
            token,
          })
        );
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to update visit status");
      });
  };

  const handleView = (record) => {
    setSelectedVisit(record);
    setModalOpen(true);
  };

  const handleExportExcel = () => {
    if (!visits || visits.length === 0) {
      toast.error("No visit data to export!");
      return;
    }

    const exportData = visits.map((v) => ({
      "Visit ID": v.id,
      "Property Title": v.property?.title || "-",
      "Property Address": v.property?.address || "-",
      "Buyer Name": v.user?.name || "-",
      "Buyer Phone": v.user?.phone || "-",
      "Scheduled Time": new Date(v.scheduledTime).toLocaleString(),
      "Notes": v.notes || "No notes",
      "Status": v.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Visits");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `pending_visits_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const columns = [
    {
      title: "Visit ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Property",
      key: "property",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/dashboard/properties/${record.property.id}`)}
        >
          {record.property?.title || "N/A"}
        </Button>
      ),
    },
    {
      title: "Buyer",
      dataIndex: ["user", "name"],
      key: "buyer",
      render: (name) => name || "-",
    },
    {
      title: "Phone",
      dataIndex: ["user", "phone"],
      key: "phone",
      render: (phone) => phone || "-",
    },
    {
      title: "Scheduled Time",
      dataIndex: "scheduledTime",
      key: "scheduledTime",
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "PENDING" ? "orange" : status === "CONFIRMED" ? "green" : "red"}>
          {status === "PENDING" ? "Pending Review" : status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="View Full Details">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          </Tooltip>

          {/* {record.status === "PENDING" && (
            <>
              <Tooltip title="Approve Visit">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleUpdate(record.id, "CONFIRMED")}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject Visit">
                <Button
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => handleUpdate(record.id, "REJECTED")}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )} */}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visit Management</h1>
          <p className="text-gray-600 mt-1">Manage and approve pending property visit requests</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Search
            placeholder="Search by buyer name, phone or property..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
            style={{ width: 300 }}
            size="large"
          />
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            style={{ width: 150 }}
            size="large"
            placeholder="Filter by Status"
            allowClear
            onClear={() => setStatusFilter("ALL")}
          >
            <Option value="ALL">All Status</Option>
            <Option value="PENDING">Pending</Option>
            <Option value="CONFIRMED">Confirmed</Option>
            <Option value="REJECTED">Rejected</Option>
          </Select>
          <Button type="primary" size="large" onClick={handleExportExcel}>
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={paginatedVisits}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1100 }}
        bordered
      />

      {/* Pagination */}
      {totalFiltered > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={totalFiltered}
            onChange={(p) => setPage(p)}
            onShowSizeChange={(current, size) => {
              setPageSize(size);
              setPage(1);
            }}
            showSizeChanger={true}
            pageSizeOptions={["50", "100", "200"]}
            showQuickJumper
          />
        </div>
      )}

      {/* Full Details Modal Popup */}
      <Modal
        title={<span className="text-xl font-bold">Visit Request Details - ID #{selectedVisit?.id}</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
        centered
      >
        {selectedVisit && (
          <>
            {/* Property Image */}
            {selectedVisit.property?.imageUrls?.[0] && (
              <div className="mb-6 text-center">
                <Image
                  src={selectedVisit.property.imageUrls[0]}
                  alt={selectedVisit.property.title}
                  style={{ maxHeight: "400px", borderRadius: "8px", objectFit: "cover" }}
                  preview={{ mask: "Click to enlarge" }}
                />
              </div>
            )}

            <Divider>Property Details</Divider>
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Title" span={2}>
                <strong>{selectedVisit.property.title}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Type">{selectedVisit.property.type}</Descriptions.Item>
              <Descriptions.Item label="Price">₹{selectedVisit.property.price.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Area">{selectedVisit.property.area} sq ft</Descriptions.Item>
              <Descriptions.Item label="Bedrooms">{selectedVisit.property.bedrooms}</Descriptions.Item>
              <Descriptions.Item label="Bathrooms">{selectedVisit.property.bathrooms}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedVisit.property.status === "FOR_SALE" ? "green" : "default"}>
                  {selectedVisit.property.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Full Address" span={2}>
                {selectedVisit.property.address}
                <br />
                <span className="text-gray-600">
                  {selectedVisit.property.city}, {selectedVisit.property.state} - {selectedVisit.property.pincode}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedVisit.property.description || <em>No description</em>}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Visit & Buyer Details</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Buyer Name">
                    <strong>{selectedVisit.user.name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Buyer Phone">
                    {selectedVisit.user.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Scheduled Time">
                    <strong>{new Date(selectedVisit.scheduledTime).toLocaleString()}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Current Status">
                    <Tag color={selectedVisit.status === "PENDING" ? "orange" : selectedVisit.status === "CONFIRMED" ? "green" : "red"}>
                      {selectedVisit.status}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Buyer Notes">
                    {selectedVisit.notes || <em className="text-gray-500">No notes provided</em>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Request Date">
                    {new Date(selectedVisit.createdAt).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
}