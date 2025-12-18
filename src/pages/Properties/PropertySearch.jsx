// src/pages/properties/PropertySearch.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Select,
  Slider,
  Spin,
  Card,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchDistricts } from "../../redux/slices/districtSlice";

const { Option } = Select;

const PropertySearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.districts);

  // ✅ Read query params (type, district)
  const params = new URLSearchParams(location.search);
  const initialType = params.get("type") || "";
  const initialDistrict = params.get("district") || "";

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(initialType);
  const [district, setDistrict] = useState(initialDistrict);
  const [priceRange, setPriceRange] = useState([0, 100000000]);

  useEffect(() => {
    dispatch(fetchDistricts());
  }, [dispatch]);


  const propertyTypes = [
    "",
    "COMMERCIAL",
    "OFFICE_SPACE",
    "SHOP",
    "WAREHOUSE",
    "APARTMENT",
    "MULTI_FAMILY_HOME",
    "SINGLE_FAMILY_HOME",
    "STUDIO",
    "VILLA",
    "HOUSE",
    "PLOT",
    "LAND",
    "FARMLAND",

  ];

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.nearprop.com/api/properties/search`,
        {
          params: {
            type: type || undefined,
            district: district || undefined,
            page: 0,
            size: 20,
          },
        }
      );

      let data = res.data?.data || [];

      // Apply frontend filters
      data = data.filter((p) => {
        const matchesTitle =
          !title || p.title?.toLowerCase().includes(title.toLowerCase());

        const matchesDistrict =
          !district ||
          p.districtName?.toLowerCase().includes(district.toLowerCase());

        const matchesPrice =
          p.price >= priceRange[0] && p.price <= priceRange[1];

        return matchesTitle && matchesDistrict && matchesPrice;
      });

      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [type, district, priceRange]);

  const resetFilters = () => {
    setTitle("");
    setType("");
    setDistrict("");
    setPriceRange([0, 1000000000]);
    fetchProperties();
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrls",
      key: "imageUrls",
      render: (imgs) =>
        imgs?.length ? (
          <img
            src={imgs[0]}
            alt="property"
            className="w-24 h-16 object-cover rounded-lg shadow"
          />
        ) : (
          <Tag>No Image</Tag>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t) => <Tag color="blue">{t}</Tag>,
    },
    {
      title: "District",
      dataIndex: "districtName",
      key: "districtName",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (p) => <Tag color="green">₹ {p.toLocaleString()}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/dashboard/properties/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-md min-h-screen">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
        🏡 Property Search
      </h2>

      {/* Filters */}
      <Card className="mb-6 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            placeholder="Search by Title"
            prefix={<SearchOutlined />}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select
            placeholder="Select Type"
            value={type || undefined}
            onChange={(v) => setType(v)}
            allowClear
            className="w-full"
          >
            {propertyTypes.map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>

          <Select
            showSearch
            placeholder="Select District"
            value={district || undefined}
            onChange={(v) => setDistrict(v)}
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            className="w-full"
            options={list?.map((d) => ({
              label: `${d.name} (${d.state})`,
              value: d.name,
            }))}
          />

          <div className="col-span-1 sm:col-span-2">
            <span className="text-gray-600 text-sm">Price Range</span>
            <Slider
              range
              min={0}
              max={1000000000}
              step={50000}
              value={priceRange}
              onChange={(v) => setPriceRange(v)}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3 col-span-1 sm:col-span-2 lg:col-span-3">
            <Button type="primary" onClick={fetchProperties} block>
              Apply Filters
            </Button>
            <Button onClick={resetFilters} icon={<ReloadOutlined />} block>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Property List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            dataSource={properties}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            bordered
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default PropertySearch;
