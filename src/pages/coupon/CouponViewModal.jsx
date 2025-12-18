
// src/pages/coupons/CouponViewModal.jsx
import React from "react";
import { Modal, Descriptions, Tag, Spin } from "antd";
import { useSelector } from "react-redux";

const CouponViewModal = ({ open, onClose }) => {
  const { singleCoupon } = useSelector((state) => state.coupons);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Coupon Details" width={600}>
      {singleCoupon ? (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Code">{singleCoupon.code}</Descriptions.Item>
          <Descriptions.Item label="Description">{singleCoupon.description}</Descriptions.Item>
          <Descriptions.Item label="Type">{singleCoupon.discountType}</Descriptions.Item>
          {singleCoupon.discountType === "PERCENTAGE" ? (
            <>
              <Descriptions.Item label="Percentage">
                {singleCoupon.discountPercentage}%
              </Descriptions.Item>
              <Descriptions.Item label="Max Discount">
                ₹{singleCoupon.maxDiscount}
              </Descriptions.Item>
            </>
          ) : (
            <Descriptions.Item label="Discount Amount">
              ₹{singleCoupon.discountAmount}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Valid From">
            {new Date(singleCoupon.validFrom).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Valid Until">
            {new Date(singleCoupon.validUntil).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Max Uses">
            {singleCoupon.maxUses}
          </Descriptions.Item>
          <Descriptions.Item label="Subscription Type">
            {singleCoupon.subscriptionType || "All"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={singleCoupon.active ? "green" : "red"}>
              {singleCoupon.active ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Spin />
      )}
    </Modal>
  );
};

export default CouponViewModal;
