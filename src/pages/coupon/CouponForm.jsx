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
const { Option } = Select; // ✅ Add this import

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
        subscriptionType, // ← assuming your backend uses this field name
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
        type: subscriptionType, // ← now an array for multiple types
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
      type, // ← this is now an array
      ...rest
    } = values;

    const [validFrom, validUntil] = validity;

    const payload = {
      ...rest,
      type, // ← send array of types
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
              <Input placeholder="e.g., WELCOME2025" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="type"
              label="Applicable Plan Types"
              rules={[{ required: true, message: "Select at least one plan type" }]}
            >
              <Select
                mode="multiple" // ✅ Enable multiple selection
                placeholder="Select one or more plan types"
                allowClear
                style={{ width: "100%" }}
              >
                <Option value="SELLER">Seller</Option>
                <Option value="ADVISOR">Advisor</Option>
                <Option value="DEVELOPER">Developer</Option>
                {/* <Option value="FRANCHISEE">Franchisee</Option> */}
                {/* Uncomment if needed later */}
                {/* <Option value="PROPERTY">Property</Option> */}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="description" label="Description (Optional)">
              <Input.TextArea rows={3} placeholder="Describe what this coupon offers..." />
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
                  { label: "Percentage (%)", value: "PERCENTAGE" },
                  { label: "Fixed Amount (₹)", value: "FIXED_AMOUNT" },
                ]}
                placeholder="Choose discount type"
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

          {discountType === "FIXED_AMOUNT" ? (
            <Col xs={24} md={12}>
              <Form.Item
                name="discountAmount"
                label="Discount Amount (₹)"
                rules={[{ required: true, message: "Enter discount amount" }]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  formatter={(value) => `₹ ${value}`}
                  parser={(value) => value.replace("₹ ", "")}
                />
              </Form.Item>
            </Col>
          ) : discountType === "PERCENTAGE" ? (
            <>
              <Col xs={24} md={6}>
                <Form.Item
                  name="discountPercentage"
                  label="Discount Percentage"
                  rules={[{ required: true, message: "Enter percentage" }]}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace("%", "")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="maxDiscount"
                  label="Max Discount Amount (₹)"
                  // rules={[{ required: true, message: "Enter max discount" }]}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    formatter={(value) => `₹ ${value}`}
                    parser={(value) => value.replace("₹ ", "")}
                  />
                </Form.Item>
              </Col>
            </>
          ) : null}

          <Col xs={24} md={12}>
            <Form.Item
              name="validity"
              label="Validity Period"
              rules={[{ required: true, message: "Select validity dates" }]}
            >
              <RangePicker
                className="w-full"
                showTime={{ format: "HH:mm" }}
                format="YYYY-MM-DD HH:mm"
                placeholder={["Start Date & Time", "End Date & Time"]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="maxUses"
              label="Maximum Uses"
              rules={[{ required: true, message: "Enter max uses" }]}
            >
              <InputNumber className="w-full" min={1} placeholder="e.g., 100" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6} className="flex items-end">
            <Form.Item name="active" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            {isEdit ? "Update Coupon" : "Create Coupon"}
          </Button>
          <Button
            className="ml-3"
            onClick={() => navigate("/dashboard/coupons")}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CouponForm;