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
  InputNumber,
  theme,
  ConfigProvider,
  Row,
  Col,
  Typography,
  Badge,
  Divider,
} from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined, CopyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { fetchBanquets } from "../../redux/slices/hotelBanquetSlice";

const { Option } = Select;
const { Title, Text } = Typography;

const useDebounced = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export default function AllBanquets() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { banquets: banquetsRaw, loading } = useSelector((s) => s.hotelBanquet);

  // Normalize data
  const banquets = useMemo(() => {
    if (banquetsRaw?.data?.banquetHalls) return banquetsRaw.data.banquetHalls;
    if (Array.isArray(banquetsRaw)) return banquetsRaw;
    return [];
  }, [banquetsRaw]);

  // UI state
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState([]);
  const [stateFilter, setStateFilter] = useState([]);
  const [eventTypesFilter, setEventTypesFilter] = useState([]);
  const [cateringFilter, setCateringFilter] = useState([]);
  const [capMin, setCapMin] = useState();
  const [capMax, setCapMax] = useState();
  const [priceMin, setPriceMin] = useState();
  const [priceMax, setPriceMax] = useState();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounced(search, 400);

  useEffect(() => {
    dispatch(fetchBanquets());
  }, [dispatch]);

  // Filter options
  const cityOptions = useMemo(
    () => Array.from(new Set(banquets.map((b) => b.city).filter(Boolean))).sort(),
    [banquets]
  );
  const stateOptions = useMemo(
    () => Array.from(new Set(banquets.map((b) => b.state).filter(Boolean))).sort(),
    [banquets]
  );
  const allEventTypes = useMemo(() => {
    const s = new Set();
    banquets.forEach((b) => (b.eventTypes || []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [banquets]);
  const allCatering = useMemo(() => {
    const s = new Set();
    banquets.forEach((b) => (b.cateringOptions || []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [banquets]);

  // Filtered data
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    return banquets
      .filter((b) => {
        const matchesSearch =
          !q ||
          (b.name || "").toLowerCase().includes(q) ||
          (b.banquetHallId || "").toLowerCase().includes(q) ||
          (b.city || "").toLowerCase().includes(q) ||
          (b.state || "").toLowerCase().includes(q) ||
          String(b.pincode || "").toLowerCase().includes(q);

        const matchesCity =
          cityFilter.length === 0 || cityFilter.includes(b.city || "");

        const matchesState =
          stateFilter.length === 0 || stateFilter.includes(b.state || "");

        const matchesEvents =
          eventTypesFilter.length === 0 ||
          (b.eventTypes || []).some((t) => eventTypesFilter.includes(t));

        const matchesCatering =
          cateringFilter.length === 0 ||
          (b.cateringOptions || []).some((t) => cateringFilter.includes(t));

        const matchesCap =
          (capMin === undefined || (b.capacity || 0) >= capMin) &&
          (capMax === undefined || (b.capacity || 0) <= capMax);

        const price = Number(b.pricePerEvent || 0);
        const matchesPrice =
          (priceMin === undefined || price >= priceMin) &&
          (priceMax === undefined || price <= priceMax);

        return (
          matchesSearch &&
          matchesCity &&
          matchesState &&
          matchesEvents &&
          matchesCatering &&
          matchesCap &&
          matchesPrice
        );
      })
      .sort((a, b) => (b.capacity || 0) - (a.capacity || 0)); // Default sort: capacity descending
  }, [
    banquets,
    debouncedSearch,
    cityFilter,
    stateFilter,
    eventTypesFilter,
    cateringFilter,
    capMin,
    capMax,
    priceMin,
    priceMax,
  ]);

  // KPIs
  const kpiTotal = filtered.length;
  const kpiBig = filtered.filter((b) => (b.capacity || 0) >= 300).length;
  const kpiVeg = filtered.filter((b) =>
    (b.cateringOptions || []).includes("veg")
  ).length;
  const kpiNonVeg = filtered.filter((b) =>
    (b.cateringOptions || []).includes("non-veg")
  ).length;

  // Enhanced columns with more details and colors
  const columns = [
    {
      title: "Banquet",
      key: "name",
      width: 360,
      render: (_, r) => {
        const img =
          Array.isArray(r.images) && r.images.length ? r.images[0] : null;
        return (
          <Space align="start">
            <Image
              src={img}
              width={72}
              height={72}
              style={{ objectFit: "cover", borderRadius: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
              fallback="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>"
              preview={false}
            />
            <div className="flex flex-col">
              <Tooltip title={r.description || "No description"}>
                <div className="font-semibold text-blue-800 hover:text-blue-600 cursor-pointer">
                  {r.name || "—"}
                </div>
              </Tooltip>
              <div className="text-xs text-gray-600">
                {/* ID: <Text copyable={{ text: r.banquetHallId }}>{r.banquetHallId || "—"}</Text> • {r.city || "—"},{" "} */}
                {r.state || "—"} {r.pincode ? `• ${r.pincode}` : ""}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {(r.eventTypes || []).map((t) => (
                  <Tag key={t} color="cyan" style={{ fontSize: "10px" }}>{t}</Tag>
                ))}
              </div>
            </div>
          </Space>
        );
      },
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      width: 120,
      render: (v) => (
        <Badge count={v} showZero color={v >= 300 ? "gold" : "blue"} />
      ),
      sorter: (a, b) => (a.capacity || 0) - (b.capacity || 0),
    },
    {
      title: "Catering",
      key: "catering",
      width: 160,
      render: (_, r) => (
        <Space wrap>
          {(r.cateringOptions || []).map((c) => (
            <Tag key={c} color={c === "veg" ? "lime" : "volcano"}>
              {c.toUpperCase()}
            </Tag>
          ))}
          {(r.cateringOptions || []).length === 0 && <Text type="secondary">—</Text>}
        </Space>
      ),
    },
    {
      title: "Price / Event",
      dataIndex: "pricePerEvent",
      key: "price",
      width: 150,
      render: (v) => (v ? <Text style={{ color: v > 50000 ? "red" : "green" }}>₹ {v.toLocaleString()}</Text> : "—"),
      sorter: (a, b) => (a.pricePerEvent || 0) - (b.pricePerEvent || 0),
    },
   
    {
      title: "Date Added",
      key: "createdAt",
      width: 140,
      render: (_, r) => moment(r.createdAt).format("MMM DD, YYYY"),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: "Actions",
      key: "actions",
    
      width: 100,
      render: (_, r) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined style={{ color: "#1890ff" }} />}
              onClick={() => navigate(`/dashboard/all-banquets/${r.banquetHallId}`)}
            />
          </Tooltip>
         
        </Space>
      ),
    },
  ];

  // Enhanced KPIs with colors
  const kpis = [
    { title: "Total Banquets", value: kpiTotal, color: "geekblue" },
    { title: "Large Capacity (≥300)", value: kpiBig, color: "gold" },
    { title: "Veg Catering", value: kpiVeg, color: "lime" },
    { title: "Non-Veg Catering", value: kpiNonVeg, color: "volcano" },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
          colorBgContainer: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        },
        components: {
          Card: {
            headerBg: "#f0f2f5",
          },
          Table: {
            headerBg: "#fafafa",
            rowHoverBg: "#f5f5f5",
          },
        },
      }}
    >
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <Spin spinning={loading} tip="Loading banquet halls...">
          {/* Header */}
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1d4ed8" }}>
                All Banquet Halls
              </Title>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => dispatch(fetchBanquets())}
              >
                Refresh List
              </Button>
            </Col>
          </Row>

          <Divider />

          {/* Enhanced Filters */}
          <Card title="Filters" bordered={false} style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Input
                  allowClear
                  placeholder="Search name / ID / city / state / pincode"
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Filter by City"
                  value={cityFilter}
                  onChange={(v) => {
                    setCityFilter(v);
                    setPage(1);
                  }}
                  style={{ width: "100%" }}
                >
                  {cityOptions.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Filter by State"
                  value={stateFilter}
                  onChange={(v) => {
                    setStateFilter(v);
                    setPage(1);
                  }}
                  style={{ width: "100%" }}
                >
                  {stateOptions.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Event Types"
                  value={eventTypesFilter}
                  onChange={(v) => {
                    setEventTypesFilter(v);
                    setPage(1);
                  }}
                  style={{ width: "100%" }}
                >
                  {allEventTypes.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Catering Options"
                  value={cateringFilter}
                  onChange={(v) => {
                    setCateringFilter(v);
                    setPage(1);
                  }}
                  style={{ width: "100%" }}
                >
                  {allCatering.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Col>
              {/* <Col xs={24} sm={12} md={6}>
                <Row gutter={8}>
                  <Col span={12}>
                    <InputNumber
                      placeholder="Min Cap."
                      value={capMin}
                      onChange={(v) => {
                        setCapMin(v);
                        setPage(1);
                      }}
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col span={12}>
                    <InputNumber
                      placeholder="Max Cap."
                      value={capMax}
                      onChange={(v) => {
                        setCapMax(v);
                        setPage(1);
                      }}
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Col>
                </Row>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Row gutter={8}>
                  <Col span={12}>
                    <InputNumber
                      placeholder="Min Price"
                      value={priceMin}
                      onChange={(v) => {
                        setPriceMin(v);
                        setPage(1);
                      }}
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col span={12}>
                    <InputNumber
                      placeholder="Max Price"
                      value={priceMax}
                      onChange={(v) => {
                        setPriceMax(v);
                        setPage(1);
                      }}
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Col>
                </Row>
              </Col> */}
            </Row>
          </Card>

          {/* Enhanced KPIs with colors and icons */}
          <Row gutter={[16, 16]}>
            {kpis.map((kpi, idx) => (
              <Col xs={24} sm={12} md={6} key={idx}>
                <Card hoverable bordered={false} style={{ backgroundColor: "#f6ffed", border: "1px solid #b7eb8f" }}>
                  <Statistic
                    title={kpi.title}
                    value={kpi.value}
                    valueStyle={{ color: "#389e0d" }}
                    prefix={<Badge color={kpi.color} />}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Divider */}
          <Divider />

          {/* Enhanced Table with striped rows and hover effects */}
          <Table
            rowKey={(r) => r.banquetHallId || r._id}
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
            scroll={{ x: 1200 }}
            rowClassName={(record, index) => (index % 2 === 0 ? "table-row-light" : "table-row-dark")}
            bordered
            style={{ backgroundColor: "#fff", borderRadius: 8 }}
          />
        </Spin>
      </div>
    </ConfigProvider>
  );
}