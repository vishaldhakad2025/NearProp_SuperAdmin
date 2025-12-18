import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Input,
  Select,
  Tag,
  Image,
  Tooltip,
  Button,
  Space,
  Card,
  Statistic,
  Spin,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CopyOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { fetchHotels } from "../../redux/slices/hotelBanquetSlice";

const { Option } = Select;

const useDebounced = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const statusColor = (s) =>
  ({
    approved: "green",
    pending: "orange",
    rejected: "red",
    suspended: "volcano",
  }[String(s || "").toLowerCase()] || "default");

const verifBadge = (verified) =>
  verified ? (
    <CheckCircleTwoTone twoToneColor="#52c41a" />
  ) : (
    <CloseCircleTwoTone twoToneColor="#bfbfbf" />
  );

export default function AllHotels() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { hotels: hotelsRaw, loading } = useSelector((s) => s.hotelBanquet);

  // Normalize to array for both slice return styles:
  const hotels = useMemo(() => {
    // if slice kept entire response: { success, data: { hotels: [] } }
    if (hotelsRaw?.data?.hotels) return hotelsRaw.data.hotels;

    if (Array.isArray(hotelsRaw)) return hotelsRaw;
    return [];
  }, [hotelsRaw]);

  // ===== UI state
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState([]);
  const [stateFilter, setStateFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [verificationFilter, setVerificationFilter] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounced(search, 400);

  // ===== Fetch
  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  // Derived options
  const cityOptions = useMemo(
    () => Array.from(new Set(hotels.map((h) => h.city).filter(Boolean))),
    [hotels]
  );
  const stateOptions = useMemo(
    () => Array.from(new Set(hotels.map((h) => h.state).filter(Boolean))),
    [hotels]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(hotels.map((h) => h.status).filter(Boolean))),
    [hotels]
  );
  const verificationOptions = useMemo(
    () =>
      Array.from(
        new Set(hotels.map((h) => h.verificationStatus).filter(Boolean))
      ),
    [hotels]
  );

  // ===== Filtering + sorting (client-side)
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    let data = hotels.filter((h) => {
      const matchesSearch =
        !q ||
        (h.name || "").toLowerCase().includes(q) ||
        (h.hotelId || "").toLowerCase().includes(q) ||
        (h.city || "").toLowerCase().includes(q) ||
        (h.state || "").toLowerCase().includes(q) ||
        (h.pincode || "").toLowerCase().includes(q);

      const matchesCity =
        cityFilter.length === 0 || cityFilter.includes(h.city || "");
      const matchesState =
        stateFilter.length === 0 || stateFilter.includes(h.state || "");
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(h.status || "");
      const matchesVerification =
        verificationFilter.length === 0 ||
        verificationFilter.includes(h.verificationStatus || "");

      return (
        matchesSearch &&
        matchesCity &&
        matchesState &&
        matchesStatus &&
        matchesVerification
      );
    });

    // default sort: newest first
    data = data.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    return data;
  }, [
    hotels,
    debouncedSearch,
    cityFilter,
    stateFilter,
    statusFilter,
    verificationFilter,
  ]);

  // KPIs
  const kpiTotal = filtered.length;
  const kpiApproved = filtered.filter((h) => h.status === "approved").length;
  const kpiVerified = filtered.filter(
    (h) => String(h.verificationStatus).toLowerCase() === "verified"
  ).length;
  const kpiActiveSubs = filtered.filter(
    (h) => (h.subscriptions || []).some((s) => s.isActive)
  ).length;

  // columns
  const columns = [
    {
      title: "Hotel",
      dataIndex: "name",
      key: "name",
      width: 360,
      render: (_, r) => {
        const img = Array.isArray(r.images) && r.images.length ? r.images[0] : null;
        return (
          <Space align="start">
            <Image
              src={img}
              width={72}
              height={72}
              style={{ objectFit: "cover", borderRadius: 12 }}
              fallback="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>"
              preview={false}
            />
            <div className="flex flex-col">
              <div className="font-semibold text-gray-800">{r.name || "—"}</div>
              <div className="text-[12px] text-gray-500">
                ID: {r.hotelId || "—"} • {r.city || "—"}, {r.state || "—"}{" "}
                {r.pincode ? `• ${r.pincode}` : ""}
              </div>
              <div className="mt-1 flex flex-wrap gap-6">
                <span className="text-[12px] text-gray-600">
                  Status: <Tag color={statusColor(r.status)}>{r.status || "—"}</Tag>
                </span>
                <span className="text-[12px] text-gray-600 flex items-center gap-1">
                  Verify: {verifBadge(String(r.verificationStatus).toLowerCase() === "verified")}
                  <span className="ml-1">{r.verificationStatus || "—"}</span>
                </span>
                {r.isAvailable !== undefined && (
                  <Tag color={r.isAvailable ? "green" : "default"}>
                    {r.isAvailable ? "Available" : "Unavailable"}
                  </Tag>
                )}
              </div>
            </div>
          </Space>
        );
      },
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Subscriptions",
      key: "subs",
      width: 240,
      render: (_, r) => {
        const active = (r.subscriptions || []).find((s) => s.isActive);
        if (!active) return <span className="text-gray-500">—</span>;
        return (
          <div className="text-[12px]">
            <div className="text-gray-700">
              {active?.planId?.name || "Plan"} • {active?.planId?.planType}
            </div>
            <div className="text-gray-500">
              Ends: {active?.endDate ? moment(active.endDate).format("YYYY-MM-DD") : "—"}
            </div>
            <Tag className="mt-1" color="green">Active</Tag>
          </div>
        );
      },
      sorter: (a, b) =>
        Number((a.subscriptions || []).some((s) => s.isActive)) -
        Number((b.subscriptions || []).some((s) => s.isActive)),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (v) => (v ? moment(v).format("YYYY-MM-DD") : "—"),
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 130,
      render: (_, r) => (
        <Space>
          <Tooltip title="Open details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/dashboard/all-hotels/${r.hotelId}`)}
            />
          </Tooltip>
          {/* <Tooltip title="Copy Hotel ID">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(r.hotelId || "");
                toast.success("Hotel ID copied");
              }}
            />
          </Tooltip> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <Spin spinning={loading}>
        {/* Header / Controls */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl mb-5">
          <div className="flex flex-col lg:flex-row gap-3 justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold m-0">All Hotels</h2>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => dispatch(fetchHotels())}
              >
                Refresh
              </Button>
            </Space>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input
              allowClear
              placeholder="Search name / ID / city / state / pincode"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              mode="multiple"
              allowClear
              placeholder="City"
              value={cityFilter}
              onChange={(v) => {
                setCityFilter(v);
                setPage(1);
              }}
            >
              {cityOptions.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              allowClear
              placeholder="State"
              value={stateFilter}
              onChange={(v) => {
                setStateFilter(v);
                setPage(1);
              }}
            >
              {stateOptions.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              allowClear
              placeholder="Status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              {statusOptions.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              allowClear
              placeholder="Verification"
              value={verificationFilter}
              onChange={(v) => {
                setVerificationFilter(v);
                setPage(1);
              }}
            >
              {verificationOptions.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <Statistic title="Total" value={kpiTotal} />
          </Card>
          <Card className="shadow-sm">
            <Statistic title="Approved" value={kpiApproved} />
          </Card>
          <Card className="shadow-sm">
            <Statistic title="Verified" value={kpiVerified} />
          </Card>
          <Card className="shadow-sm">
            <Statistic title="Active Subscriptions" value={kpiActiveSubs} />
          </Card>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <Table
            rowKey={(r) => r.hotelId || r._id}
            columns={columns}
            dataSource={filtered}
            pagination={{
              current: page,
              pageSize,
              total: filtered.length,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            scroll={{ x: 900 }}
          />
        </div>
      </Spin>
    </div>
  );
}
