import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlans, addPlan, deletePlan, updatePlan } from "../../redux/slices/hotelsPlansSlice";
import { Button, Table, Modal, Form, Input, InputNumber, Select, message, Space } from "antd";

const { Option } = Select;

const HotelPlansPage = () => {
  const dispatch = useDispatch();
  const { plans, loading } = useSelector((state) => state.hotelplans);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();

  // fetch on mount
  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  // open modal for add/edit
  const openModal = (plan = null) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
    if (plan) {
      form.setFieldsValue(plan);
    } else {
      form.resetFields();
    }
  };

  // save plan (add or update)
  const handleSavePlan = async () => {
    try {
      const values = await form.validateFields();
      if (editingPlan) {
        await dispatch(updatePlan({ planId: editingPlan._id, planData: values })).unwrap();
        message.success("Plan updated successfully");
      } else {
        await dispatch(addPlan(values)).unwrap();
        message.success("Plan added successfully");
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      form.resetFields();
    } catch (err) {
      message.error("Failed to save plan");
    }
  };

  // delete plan
  const handleDelete = async (id) => {
    try {
      await dispatch(deletePlan(id)).unwrap();
      message.success("Plan deleted");
    } catch (err) {
      message.error("Failed to delete plan");
    }
  };

  // table columns
  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Type", dataIndex: "planType" },
    { title: "Price", dataIndex: "price" },
    { title: "For", dataIndex: "planFor" },
    { title: "Rooms", dataIndex: "roomLimit" },
    { title: "Reels", dataIndex: "reelsLimit" },
    {
      title: "Action",
      render: (record) => (
        <Space>
          <Button onClick={() => openModal(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record._id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Subscription Plans</h2>
        <Button type="primary" onClick={() => openModal()}>
          + Add Plan
        </Button>
      </div>

      <Table
        dataSource={plans}
        columns={columns}
        rowKey="_id"
        loading={loading}
        bordered
      />

      <Modal
        title={editingPlan ? "Edit Plan" : "Add New Plan"}
        open={isModalOpen}
        onOk={handleSavePlan}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Plan Name"
            rules={[{ required: true, message: "Plan name is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="planType"
            label="Plan Type"
            rules={[{ required: true, message: "Plan type required" }]}
          >
            <Select placeholder="Select Type">
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
              <Option value="half_yearly">Half-Yearly</Option>
              <Option value="yearly">Yearly</Option>
              <Option value="3_years">3 Years</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="planFor"
            label="Plan For"
            rules={[{ required: true, message: "Please select plan for" }]}
          >
            <Select placeholder="Select Plan For">
              <Option value="hotel">Hotel</Option>
              <Option value="banquet">Banquet</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (₹)"
            rules={[{ required: true, message: "Price required" }]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>

          {/* roomLimit only if hotel */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.planFor !== curr.planFor}>
            {({ getFieldValue }) =>
              getFieldValue("planFor") === "hotel" && (
                <Form.Item
                  name="roomLimit"
                  label="Room Limit"
                  rules={[{ required: true, message: "Room limit required for hotel plans" }]}
                >
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            name="reelsLimit"
            label="Reels Limit"
            rules={[{ required: true, message: "Reels limit required" }]}
          >   
            <InputNumber className="w-full" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HotelPlansPage;
