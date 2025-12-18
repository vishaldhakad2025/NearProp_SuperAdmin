// src/pages/subscription/SubscriptionPlanForm.jsx
import React, { useEffect } from "react";
import { Form, Input, InputNumber, Button, Select, Switch, Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSubscriptionPlan,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
} from "../../redux/slices/subscriptionPlanSlice";

const { TextArea } = Input;
const { Option } = Select;

const SubscriptionPlanForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { singlePlan, loading } = useSelector((state) => state.subscriptionPlans);

  useEffect(() => {
    if (id) {
      dispatch(getSingleSubscriptionPlan(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && singlePlan) {
      form.setFieldsValue(singlePlan);
    }
  }, [id, singlePlan, form]);

  const onFinish = (values) => {
    const payload = {
      ...values,
      price: Number(values.price),
      marketingFee: Number(values.marketingFee),
    };

    if (id) {
      dispatch(updateSubscriptionPlan({ planId: id, data: payload }));
    } else {
      dispatch(createSubscriptionPlan(payload));
    }
    navigate("/dashboard/subscriptions");
  };

  return (
    <div className="p-4 flex justify-center">
      <Card className="w-full max-w-6xl" title={id ? "Edit Plan" : "Create New Plan"}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ active: true, type: "SELLER" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="name" label="Plan Name" rules={[{ required: true }]}> 
              <Input placeholder="e.g., Basic" />
            </Form.Item>

            {/* Enhanced Types */}
            <Form.Item name="type" label="Type" rules={[{ required: true }]}> 
              <Select placeholder="Select Plan Type">
                <Option value="SELLER">Seller</Option>
                <Option value="ADVISOR">Advisor</Option>
                <Option value="DEVELOPER">Developer</Option>
                <Option value="FRANCHISEE">Franchisee</Option>
                <Option value="PROPERTY">Property</Option>
              </Select>
            </Form.Item>

            <Form.Item name="price" label="Price (₹)" rules={[{ required: true }]}> 
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="marketingFee" label="Marketing Fee (₹)" rules={[{ required: true }]}> 
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="durationDays" label="Duration (Days)" rules={[{ required: true }]}> 
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="maxProperties" label="Max Properties" rules={[{ required: true }]}> 
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="maxReelsPerProperty" label="Max Reels / Property" rules={[{ required: true }]}> 
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="maxTotalReels" label="Max Total Reels" rules={[{ required: true }]}> 
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="contentHideAfterDays" label="Hide Content After (Days)" rules={[{ required: true }]}> 
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="contentDeleteAfterDays" label="Delete Content After (Days)" rules={[{ required: true }]}> 
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}> 
            <TextArea rows={3} placeholder="Enter plan description" />
          </Form.Item>

          <div className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SubscriptionPlanForm;
