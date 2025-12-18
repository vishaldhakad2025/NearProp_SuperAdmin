import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveProperty,
  deleteProperty,
  getAllProperties,
  rejectProperty,
  toggleFeaturedProperty,
} from "../../redux/slices/propertySlice";
import {
  Table,
  Button,
  Image,
  Tag,
  Tooltip,
  Space,
  Switch,
  Input,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Trash } from "lucide-react";
import { Select } from "antd"; // Add this import

const { Option } = Select;
const AllProperties = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { all: properties, loading } = useSelector((state) => state.property);
const [propertyTypeFilter, setPropertyTypeFilter] = useState(null);
const [featuredFilter, setFeaturedFilter] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filteredProperties, setFilteredProperties] = useState([]);

  useEffect(() => {
    dispatch(getAllProperties());
  }, [dispatch]);

useEffect(() => {
  let filtered = properties;

  // 🔍 Search across multiple fields
  if (searchText) {
    const lowerText = searchText.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title?.toLowerCase().includes(lowerText) ||
        p.city?.toLowerCase().includes(lowerText) ||
        p.districtName?.toLowerCase().includes(lowerText) ||
        p.owner?.phone?.toLowerCase().includes(lowerText) ||
        p.id?.toString().includes(lowerText) ||
        p.permanentId?.toLowerCase().includes(lowerText)
    );
  }

  // 🔎 Filter by property type
  if (propertyTypeFilter) {
    filtered = filtered.filter((p) => p.type === propertyTypeFilter);
  }

  // ⭐ Filter by featured
  if (featuredFilter) {
    filtered = filtered.filter((p) =>
      featuredFilter === "featured" ? p.featured : !p.featured
    );
  }

  setFilteredProperties(filtered);
}, [searchText, propertyTypeFilter, featuredFilter, properties]);


  const handleStatusChange = async (propertyId, action) => {
    const result = await Swal.fire({
      title: `Are you sure you want to ${action} this property?`,
      icon: action === "approve" ? "success" : "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
      confirmButtonColor: action === "approve" ? "#00b96b" : "#d33",
    });

    if (result.isConfirmed) {
      if (action === "approve") dispatch(approveProperty(propertyId));
      else dispatch(rejectProperty(propertyId));
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    const result = await Swal.fire({
      title: `Are you sure you want to delete this property?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, delete`,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      dispatch(deleteProperty(propertyId));
    }
  };

  const handleToggleFeatured = (propertyId, featured) => {
    dispatch(toggleFeaturedProperty({ propertyId, featured }));
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrls",
      render: (images) => (
        <Image
          width={70}
          src={images?.[0]}
          alt="Property"
          style={{ borderRadius: 6 }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">{record.permanentId}</div>
        </div>
      ),
    },
    {
      title: "City",
      dataIndex: "city",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      render: (owner) => (
        <div>
          <div>{owner?.name}</div>
          <div className="text-xs text-gray-400">{owner?.phone}</div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => `₹${price.toLocaleString()}`,
    },
    {
      title: "Area",
      render: (_, record) =>
        `${record.area} ${record.sizePostfix || "sq ft"}`,
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Label",
      dataIndex: "label",
      render: (label) => <Tag color="purple">{label}</Tag>,
    },
    {
      title: "Featured",
      dataIndex: "featured",
      render: (featured, record) => (
        <Switch
          checked={featured}
          checkedChildren={<StarFilled />}
          unCheckedChildren={<StarOutlined />}
          onChange={(checked) => handleToggleFeatured(record.id, checked)}
        />
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/dashboard/properties/${record.id}`)}
            />
          </Tooltip>

          {!record.approved && (
            <Tooltip title="Approve">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusChange(record.id, "approve")}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button
              danger
              icon={<Trash />}
              onClick={() => handleDeleteProperty(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold my-2">Properties</h2>
      <div className="flex flex-wrap gap-3 items-center mb-4 text-xl">
        <Input
          placeholder="Search by ID, title, city, district or phone"
          value={searchText}
         
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />

        <Select
          placeholder="Filter by Property Type"
          style={{ width: 180 }}
          allowClear
          onChange={(value) => setPropertyTypeFilter(value)}
        >
           <Option value="">All</Option>
          <Option value="COMMERCIAL">Commercial</Option>
          {/* <Option value="RESIDENTIAL">Residential</Option> */}
          <Option value="APARTMENT">Apartment</Option>
          <Option value="OFFICE_SPACE">Office Space</Option>
          <Option value="SHOP">Shop</Option>
          <Option value="WAREHOUSE">Warehouse</Option>
          <Option value="SINGLE_FAMILY_HOME">Single Family Home</Option>
          <Option value="MULTI_FAMILY_HOME">Multi Family Home</Option>
          <Option value="STUDIO">Studio</Option>
          <Option value="VILLA">Villa</Option>
          <Option value="HOUSE">House</Option>
          <Option value="PLOT">Ploat</Option>
          <Option value="LAND">Land</Option>
          <Option value="FARMLAND">FarmLand</Option>
          
        </Select>

        <Select
          placeholder="Featured/Non-featured"
          style={{ width: 200 }}
          allowClear
          onChange={(value) => setFeaturedFilter(value)}
        >
           <Option value="">All</Option>
          <Option value="featured">Featured</Option>
          <Option value="non-featured">Non-featured</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProperties}
        loading={loading}
        rowKey={(record) => record.id}
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 10 }}
        bordered
      />
    </div>
  );
};

export default AllProperties;
