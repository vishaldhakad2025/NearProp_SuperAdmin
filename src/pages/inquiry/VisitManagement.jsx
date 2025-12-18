import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVisits, updateVisitStatus } from "../../redux/slices/visitsSlice";
import { Table, Tooltip, Button, Pagination, Drawer, Descriptions } from "antd";
import { CheckCircleTwoTone, CloseCircleTwoTone, EyeOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function VisitManagement() {
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { visits, loading, error, totalElements } = useSelector((s) => s.visits);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [search, setSearch] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null); // for Drawer

  useEffect(() => {
    if (token) {
      dispatch(fetchVisits({ status: "PENDING", page: page - 1, size: pageSize, token }));
    }
  }, [dispatch, token, page, pageSize]);

  const handleUpdate = (id, status) => {
    dispatch(
      updateVisitStatus({
        id,
        status,
        notes: status === "CONFIRMED" ? "Visit confirmed" : "Visit rejected",
        token,
      })
    )
      .unwrap()
      .then(() => {
        toast.success(`Visit ${status.toLowerCase()} successfully!`);
      })
      .catch((err) => {
        toast.error(err || "Failed to update visit");
      });
  };

  // Inside VisitManagement component
  const handleExportExcel = () => {
    if (!visits || visits.length === 0) {
      toast.error("No visit data to export!");
      return;
    }

    // Transform data for Excel
    const exportData = visits.map((v) => ({
      "Visit ID": v.id,
      "Property Title": v.property?.title,
      "Property Address": v.property?.address,
      "Buyer Name": v.user?.name,
      "Buyer Phone": v.user?.phone,
      "Scheduled Time": new Date(v.scheduledTime).toLocaleString(),
      "Notes": v.notes || "No notes",
      "Status": v.status,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visits");

    // Save file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `visits_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  // Table Columns
  const columns = [
    {
      title: "Visit ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Property",
      dataIndex: ["property", "title"],
      key: "property",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/dashboard/properties/${record.property.id}`)}
        >
          {record.property.title}
        </Button>
      ),
    },
    {
      title: "Buyer",
      dataIndex: ["user", "name"],
      key: "buyer",
    },
    {
      title: "Phone",
      dataIndex: ["user", "phone"],
      key: "phone",
    },
    {
      title: "Scheduled",
      dataIndex: "scheduledTime",
      key: "scheduledTime",
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Confirm Visit">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
              onClick={() => handleUpdate(record.id, "CONFIRMED")}
            >
              Confirm
            </Button>
          </Tooltip>
          <Tooltip title="Reject Visit">
            <Button
              danger
              size="small"
              icon={<CloseCircleTwoTone twoToneColor="#f5222d" />}
              onClick={() => handleUpdate(record.id, "REJECTED")}
            >
              Reject
            </Button>
          </Tooltip>
          <Tooltip title="View Visit Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedVisit(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // Filtered Data
  const filteredVisits = visits.filter(
    (v) =>
      v.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.property?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-white rounded-xl shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Visit Management</h1>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by buyer or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 pl-3 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Button type="primary" onClick={handleExportExcel}>
            Export Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredVisits}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: true }}
        className="overflow-x-auto"
      />

      {/* Pagination */}
      {totalElements > 0 && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={totalElements}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {/* Drawer for Visit Details */}
      <Drawer
        title={`Visit Details - ID ${selectedVisit?.id}`}
        placement="right"
        width={400}
        onClose={() => setSelectedVisit(null)}
        open={!!selectedVisit}
      >
        {selectedVisit && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Property Title">
              {selectedVisit.property.title}
            </Descriptions.Item>
            <Descriptions.Item label="Property Address">
              {selectedVisit.property.address}
            </Descriptions.Item>
            <Descriptions.Item label="Buyer Name">
              {selectedVisit.user?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Buyer Phone">
              {selectedVisit.user?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Scheduled Time">
              {new Date(selectedVisit.scheduledTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Notes">
              {selectedVisit.notes || "No notes"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedVisit.status}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
