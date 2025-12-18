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
} from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined, CopyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { fetchBanquets } from "../../redux/slices/hotelBanquetSlice";

const { Option } = Select;

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

  // normalize
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

  // options
  const cityOptions = useMemo(
    () => Array.from(new Set(banquets.map((b) => b.city).filter(Boolean))),
    [banquets]
  );
  const stateOptions = useMemo(
    () => Array.from(new Set(banquets.map((b) => b.state).filter(Boolean))),
    [banquets]
  );
  const allEventTypes = useMemo(() => {
    const s = new Set();
    banquets.forEach((b) => (b.eventTypes || []).forEach((t) => s.add(t)));
    return Array.from(s);
  }, [banquets]);
  const allCatering = useMemo(() => {
    const s = new Set();
    banquets.forEach((b) => (b.cateringOptions || []).forEach((t) => s.add(t)));
    return Array.from(s);
  }, [banquets]);

  // filtering
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
      .sort((a, b) => (b.capacity || 0) - (a.capacity || 0)); // default: capacity desc
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
              style={{ objectFit: "cover", borderRadius: 12 }}
              fallback="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>"
              preview={false}
            />
            <div className="flex flex-col">
              <div className="font-semibold text-gray-800">
                {r.name || "—"}
              </div>
              <div className="text-[12px] text-gray-500">
                ID: {r.banquetHallId || "—"} • {r.city || "—"},{" "}
                {r.state || "—"} {r.pincode ? `• ${r.pincode}` : ""}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {(r.eventTypes || []).map((t) => (
                  <Tag key={t}>{t}</Tag>
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
      sorter: (a, b) => (a.capacity || 0) - (b.capacity || 0),
    },
    {
      title: "Catering",
      key: "catering",
      width: 160,
      render: (_, r) => (
        <Space wrap>
          {(r.cateringOptions || []).map((c) => (
            <Tag key={c} color={c === "veg" ? "green" : "magenta"}>
              {c}
            </Tag>
          ))}
          {(r.cateringOptions || []).length === 0 && <span>—</span>}
        </Space>
      ),
    },
    {
      title: "Price / Event",
      dataIndex: "pricePerEvent",
      key: "price",
      width: 150,
      render: (v) => (v ? `₹ ${v.toLocaleString()}` : "—"),
      sorter: (a, b) => (a.pricePerEvent || 0) - (b.pricePerEvent || 0),
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
              onClick={() =>
                navigate(`/dashboard/all-banquets/${r.banquetHallId}`)
              }
            />
          </Tooltip>
          {/* <Tooltip title="Copy Banquet ID">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(r.banquetHallId || "");
                toast.success("Banquet ID copied");
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
        <div className="bg-white border border-gray-100 p-4 rounded-xl mb-5">
          <div className="flex flex-col lg:flex-row gap-3 justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold m-0">All Banquet Halls</h2>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => dispatch(fetchBanquets())}
              >
                Refresh
              </Button>
            </Space>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
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
              placeholder="Event Types"
              value={eventTypesFilter}
              onChange={(v) => {
                setEventTypesFilter(v);
                setPage(1);
              }}
            >
              {allEventTypes.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              allowClear
              placeholder="Catering"
              value={cateringFilter}
              onChange={(v) => {
                setCateringFilter(v);
                setPage(1);
              }}
            >
              {allCatering.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <InputNumber
                placeholder="Cap. Min"
                value={capMin}
                onChange={(v) => {
                  setCapMin(v);
                  setPage(1);
                }}
                className="w-full"
              />
              <InputNumber
                placeholder="Cap. Max"
                value={capMax}
                onChange={(v) => {
                  setCapMax(v);
                  setPage(1);
                }}
                className="w-full"
              />
            </div>
            {/* <div className="grid grid-cols-2 gap-2 lg:col-span-2">
              <InputNumber
                placeholder="Price Min"
                value={priceMin}
                onChange={(v) => {
                  setPriceMin(v);
                  setPage(1);
                }}
                className="w-full"
              />
              <InputNumber
                placeholder="Price Max"
                value={priceMax}
                onChange={(v) => {
                  setPriceMax(v);
                  setPage(1);
                }}
                className="w-full"
              />
            </div> */}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <Statistic title="Total" value={kpiTotal} />
          </Card>
          <Card className="shadow-sm">
            <Statistic title="≥ 300 Capacity" value={kpiBig} />
          </Card>
          <Card className="shadow-sm">
            <Statistic title="Veg available" value={kpiVeg} />
          </Card>
          <Card className="shadow-sm">
            <Statistic title="Non-veg available" value={kpiNonVeg} />
          </Card>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
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
            scroll={{ x: 900 }}
          />
        </div>
      </Spin>
    </div>
  );
}
