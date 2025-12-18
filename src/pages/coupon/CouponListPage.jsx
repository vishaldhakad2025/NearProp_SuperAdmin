// src/pages/coupons/CouponListPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllCoupons,
  deleteCoupon,
  toggleCouponStatus,
  getSingleCoupon,
} from "../../redux/slices/couponSlice";
import {
  Table,
  Button,
  Tag,
  Tooltip,
  Space,
  Switch,
  Spin,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import CouponViewModal from "./CouponViewModal";

const CouponListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { coupons, loading, totalElements } = useSelector((state) => state.coupons);
  const [page, setPage] = useState(1);
  const [viewModal, setViewModal] = useState(false);
  console.log("coupon list ", coupons)
  useEffect(() => {
    dispatch(getAllCoupons({ page: page - 1, size: 10 }));
  }, [dispatch, page]);

  const handleToggle = (record) => {
    Swal.fire({
      title: `Are you sure you want to ${record.active ? "deactivate" : "activate"} this coupon?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: record.active ? "Yes, Deactivate" : "Yes, Activate",
      confirmButtonColor: record.active ? "#d33" : "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(toggleCouponStatus({ couponId: record.id, active: record.active }));
      }
    });
  };

  const handleDelete = (record) => {
    Swal.fire({
      title: "Delete this coupon?",
      text: `Are you sure you want to delete the coupon \"${record.code}\"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteCoupon(record.id));
      }
    });
  };

  const handleView = (id) => {
    dispatch(getSingleCoupon(id)).then(() => setViewModal(true));
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
    },
    {
      title: "Type",
      dataIndex: "discountType",
    },
    {
      title: "Amount / %",
      render: (_, record) =>
        record.discountType === "PERCENTAGE"
          ? `${record.discountPercentage}%`
          : `₹${record.discountAmount}`,
    },
    {
      title: "Max Uses",
      dataIndex: "maxUses",
    },
    {
      title: "Status",
      render: (_, record) => (
        <Switch checked={record.active} onChange={() => handleToggle(record)} />
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} onClick={() => navigate(`/dashboard/coupons/edit/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Coupon Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/dashboard/coupons/create")}
        >
          Add Coupon
        </Button>
      </div>
      {loading ? (
        <Spin fullscreen />
      ) : (
        <Table
          columns={columns}
          dataSource={coupons?.content}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: 10,
            total: totalElements,
            onChange: (p) => setPage(p),
          }}
        />
      )}
      <CouponViewModal open={viewModal} onClose={() => setViewModal(false)} />
    </div>
  );
};

export default CouponListPage;

