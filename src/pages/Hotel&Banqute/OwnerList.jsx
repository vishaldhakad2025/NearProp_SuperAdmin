import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Spin, Avatar, Card, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { fetchowner } from "../../redux/slices/hotelBanquetSlice";
import { useNavigate } from "react-router-dom";

const OwnerList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { owners, loading } = useSelector((s) => s.hotelBanquet);

  useEffect(() => {
    dispatch(fetchowner());
  }, [dispatch]);

  const columns = [
    {
      title: "Profile",
      dataIndex: "profileImage",
      key: "profileImage",
      render: (img) => img ? <Avatar src={img} /> : <Avatar />
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Business", dataIndex: "businessName", key: "businessName", render: (val) => val || "—" },
    { title: "Type", dataIndex: "businessType", key: "businessType" },
    {
      title: "Verified",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (val) => (val ? "✅ Yes" : "❌ No")
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Tooltip title="View Details">
          <EyeOutlined
            className="text-blue-600 cursor-pointer text-lg"
            onClick={() => navigate(`/dashboard/owners/${record._id}`)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <Card title="All Owners" className="p-4 shadow rounded-xl">
      {loading ? (
        <div className="flex justify-center p-10"><Spin size="large" /></div>
      ) : (
        <Table
          rowKey="_id"
          dataSource={owners}
          columns={columns}
          pagination={{ pageSize: 5 }}
        />
      )}
    </Card>
  );
};

export default OwnerList;
