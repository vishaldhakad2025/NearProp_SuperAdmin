import React, { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Descriptions, Avatar, Button, Table, Tag, Tooltip } from "antd";
import { ArrowBigLeft,  } from "lucide-react";
import { fetchBanquets, fetchHotels } from "../../redux/slices/hotelBanquetSlice";
import { EyeOutlined } from "@ant-design/icons";

const OwnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { owners, hotels: hotelsRaw, banquets: banquetsRaw, loading } = useSelector(
    (s) => s.hotelBanquet
  );

  useEffect(() => {
    dispatch(fetchHotels());
    dispatch(fetchBanquets());
  }, [dispatch]);

  // normalize lists
  const hotels = useMemo(() => {
    if (hotelsRaw?.data?.hotels) return hotelsRaw.data.hotels;
    if (Array.isArray(hotelsRaw)) return hotelsRaw;
    return [];
  }, [hotelsRaw]);

  const banquets = useMemo(() => {
    if (banquetsRaw?.data?.banquetHalls) return banquetsRaw.data.banquetHalls;
    if (Array.isArray(banquetsRaw)) return banquetsRaw;
    return [];
  }, [banquetsRaw]);

  // find owner
  const owner = owners.find((o) => o._id === id);

  if (!owner) {
    return <Card className="p-6">❌ Owner not found</Card>;
  }

  // filter hotels/banquets belonging to this owner
  const ownerHotels = hotels.filter((h) => h.userId === owner._id);
  const ownerBanquets = banquets.filter((b) => b.userId === owner._id);

  // reusable status renderer
  const renderStatus = (status, color = "green") => <Tag color={color}>{status}</Tag>;

  // hotel columns
  const hotelColumns = [
    { title: "Name", dataIndex: "name", key: "name", responsive: ["sm"] },
    { title: "City", dataIndex: "city", key: "city", responsive: ["sm"] },
    { title: "Pincode", dataIndex: "pincode", key: "pincode", responsive: ["md"] },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => renderStatus(s, "green") },
    {
      title: "Actions",
      key: "actions",
      render: (_, r) => (
        <Tooltip title="View Hotel Details">
          <Button
            type="text"
            icon={<EyeOutlined size={18} />}
            onClick={() => navigate(`/dashboard/all-hotels/${r.hotelId}`)}
          />
        </Tooltip>
      ),
    },
  ];

  // banquet columns
  const banquetColumns = [
    { title: "Name", dataIndex: "name", key: "name", responsive: ["sm"] },
    { title: "City", dataIndex: "city", key: "city", responsive: ["sm"] },
    { title: "Pincode", dataIndex: "pincode", key: "pincode", responsive: ["md"] },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => renderStatus(s, "blue") },
    {
      title: "Actions",
      key: "actions",
      render: (_, r) => (
        <Tooltip title="View Banquet Details">
          <Button
            type="text"
            icon={<EyeOutlined size={18} />}
            onClick={() => navigate(`/dashboard/all-banquets/${r.banquetHallId}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <Card
        title={<span className="text-lg md:text-xl font-semibold">Owner Details</span>}
        className="shadow-lg rounded-xl"
        extra={
          <Button
            className="flex items-center"
            onClick={() => navigate(-1)}
            icon={<ArrowBigLeft />}
          >
            Back
          </Button>
        }
      >
        {/* Owner profile */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <Avatar size={100} src={owner.profileImage} />
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold">{owner.name}</h2>
            <p className="text-gray-500">{owner.email}</p>
          </div>
        </div>

        {/* Owner Info */}
        <Descriptions bordered column={1} size="middle" className="bg-gray-50 md:column-2">
          <Descriptions.Item label="Mobile">{owner.mobile}</Descriptions.Item>
          <Descriptions.Item label="Gender">{owner.gender}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {owner.dateOfBirth ? new Date(owner.dateOfBirth).toLocaleDateString() : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Verified">
            {owner.isVerified ? "✅ Yes" : "❌ No"}
          </Descriptions.Item>
          <Descriptions.Item label="Aadhaar">{owner.aadhaarNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="PAN">{owner.panNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="GST">{owner.gstNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="Business Name">{owner.businessName || "—"}</Descriptions.Item>
          <Descriptions.Item label="Business Type">{owner.businessType || "—"}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>
            {owner.address
              ? `${owner.address.street || ""}, ${owner.address.city || ""}, ${owner.address.state || ""}, ${owner.address.pincode || ""}, ${owner.address.country || ""}`
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(owner.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(owner.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Hotels list */}
      <Card title="Hotels" className="mt-6 rounded-xl shadow">
        <Table
          rowKey="_id"
          dataSource={ownerHotels}
          columns={hotelColumns}
          loading={loading}
          pagination={{ pageSize: 5, showSizeChanger: true }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Banquet list */}
      <Card title="Banquet Halls" className="mt-6 rounded-xl shadow">
        <Table
          rowKey="_id"
          dataSource={ownerBanquets}
          columns={banquetColumns}
          loading={loading}
          pagination={{ pageSize: 5, showSizeChanger: true }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default OwnerDetail;
