import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Avatar, Descriptions, Button, Modal, Form, Input, Tag, Spin } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { fetchUserProfile } from "../../redux/slices/authSlice";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form] = Form.useForm();
 
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  const handleEditOpen = () => {
    form.setFieldsValue(user);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (values) => {
    console.log("Updated values:", values);
    // Dispatch update profile API here if needed
    setIsEditOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
                <Button
                  icon={<BiLeftArrowAlt />}
                  onClick={() => navigate(-1)} // Goes back one step in history
                >
                  Back
                </Button>
              </div>
      <Card
        className="shadow-md rounded-lg"
        title={<span className="text-lg font-semibold">User Profile</span>}
        // extra={
        //   <Button type="primary" icon={<EditOutlined />} onClick={handleEditOpen}>
        //     Edit
        //   </Button>
        // }
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar
            src={user.profileImageUrl}
            size={120}
            icon={<UserOutlined />}
            className="border shadow"
          />
          <Descriptions column={1} bordered labelStyle={{ fontWeight: 600 }} className="w-full">
            <Descriptions.Item label="Full Name">{user.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Mobile Number">{user.mobileNumber}</Descriptions.Item>
            <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Phone Number">{user.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label="Roles">
              {user.roles?.map((role, i) => (
                <Tag key={i} color="blue">
                  {role}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Following">
              <Tag color={user.following ? "green" : "red"}>
                {user.following ? "Following" : "Not Following"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onOk={() => form.submit()}
        title="Edit Profile"
        okText="Save"
        cancelText="Cancel"
      >
        <Form layout="vertical" form={form} onFinish={handleEditSubmit}>
          <Form.Item name="name" label="Full Name">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="mobileNumber" label="Mobile Number">
            <Input />
          </Form.Item>
          <Form.Item name="username" label="Username">
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone Number">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
