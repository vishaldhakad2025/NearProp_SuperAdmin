import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
  Switch,
  Row,
  Col,
  Divider,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  createCoupon,
  updateCoupon,
  getSingleCoupon,
} from "../../redux/slices/couponSlice";

const { RangePicker } = DatePicker;

const CouponForm = () => {
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { singleCoupon, loading } = useSelector((state) => state.coupons);

  // Fetch coupon if in edit mode
  useEffect(() => {
    if (isEdit) {
      dispatch(getSingleCoupon(id));
    }
  }, [dispatch, id, isEdit]);

  // Set initial form values when coupon loads
  useEffect(() => {
    if (singleCoupon && isEdit) {
      const {
        code,
        description,
        discountType,
        discountAmount,
        discountPercentage,
        maxDiscount,
        validFrom,
        validUntil,
        maxUses,
        active,
        subscriptionType,
      } = singleCoupon;

      form.setFieldsValue({
        code,
        description,
        discountType,
        discountAmount,
        discountPercentage,
        maxDiscount,
        maxUses,
        active,
        subscriptionType,
        validity: [dayjs(validFrom), dayjs(validUntil)],
      });
    }
  }, [singleCoupon, isEdit, form]);

  const onFinish = (values) => {
    const {
      validity,
      discountType,
      discountAmount,
      discountPercentage,
      maxDiscount,
      ...rest
    } = values;

    const [validFrom, validUntil] = validity;

    const payload = {
      ...rest,
      validFrom,
      validUntil,
      discountType,
      active: values.active || false,
      ...(discountType === "FIXED_AMOUNT"
        ? { discountAmount }
        : { discountPercentage, maxDiscount }),
    };

    if (isEdit) {
      dispatch(updateCoupon({ id, data: payload })).then(() =>
        navigate("/dashboard/coupons")
      );
    } else {
      dispatch(createCoupon(payload)).then(() =>
        navigate("/dashboard/coupons")
      );
    }
  };
  const discountType = Form.useWatch("discountType", form);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        {isEdit ? "Edit Coupon" : "Create Coupon"}
      </h2>
      <Divider />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ active: true }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="code"
              label="Coupon Code"
              rules={[{ required: true, message: "Coupon code is required" }]}
            >
              <Input placeholder="Enter unique code (e.g., WELCOME10)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Select placeholder="Select Plan Type">
                <Option value="SELLER">Seller</Option>
                <Option value="ADVISOR">Advisor</Option>
                <Option value="DEVELOPER">Developer</Option>
                <Option value="FRANCHISEE">Franchisee</Option>
                <Option value="PROPERTY">Property</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={2} placeholder="Optional description..." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="discountType"
              label="Discount Type"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: "Percentage", value: "PERCENTAGE" },
                  { label: "Fixed Amount", value: "FIXED_AMOUNT" },
                ]}
                placeholder="Select discount type"
                onChange={() => {
                  form.setFieldsValue({
                    discountAmount: undefined,
                    discountPercentage: undefined,
                    maxDiscount: undefined,
                  });
                }}
              />
            </Form.Item>
          </Col>

          {form.getFieldValue("discountType") === "FIXED_AMOUNT" ? (
            <Col xs={24} md={12}>
              <Form.Item
                name="discountAmount"
                label="Discount Amount"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  placeholder="₹ amount"
                  type="number"
                />
              </Form.Item>
            </Col>
          ) : (
            <>
              <Col xs={24} md={6}>
                <Form.Item
                  name="discountPercentage"
                  label="Discount %"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    max={100}
                    placeholder="% off"
                    type="number"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="maxDiscount"
                  label="Max Discount ₹"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    placeholder="₹ max discount"
                    type="number"
                  />
                </Form.Item>
              </Col>
            </>
          )}

          <Col xs={24} md={12}>
            <Form.Item
              name="validity"
              label="Validity Period"
              rules={[{ required: true }]}
            >
              <RangePicker
                className="w-full"
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder={["Start", "End"]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="maxUses"
              label="Max Uses"
              rules={[{ required: true }]}
            >
              <InputNumber
                className="w-full"
                min={1}
                placeholder="e.g., 100"
                type="number"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6} className="flex items-end">
            <Form.Item name="active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="mt-4">
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "Update Coupon" : "Create Coupon"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CouponForm;
