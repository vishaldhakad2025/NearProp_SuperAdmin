// // src/pages/SubAdminManagement.jsx
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchSubAdmins,
//   createSubAdmin,
//   deleteSubAdmin,
//   fetchSubAdminPermissions,
//   assignPermissions,
// } from '../../redux/slices/subAdminSlice';
// import { Button, Table, Modal, Form, Input, Select, Tag, message, Spin, Card } from 'antd';
// import { Plus, Edit, Trash2, Shield, UserCheck } from 'lucide-react';

// const { Option } = Select;

// const modules = ['PROPERTY', 'ADVERTISEMENT', 'FRANCHISEE', 'USER', 'SELLER'];
// const actions = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'];

// const SubAdminManagement = () => {
//   const dispatch = useDispatch();
//   const { list, loading, creating, permissions } = useSelector((state) => state.subAdmin);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [permModal, setPermModal] = useState({ open: false, subAdmin: null });
//   const [form] = Form.useForm();
//   const [permForm] = Form.useForm();

//   useEffect(() => {
//     dispatch(fetchSubAdmins());
//   }, [dispatch]);

//   const handleCreate = async (values) => {
//     const result = await dispatch(createSubAdmin(values));
//     if (result.meta.requestStatus === 'fulfilled') {
//       message.success('Sub-Admin created successfully');
//       setIsModalOpen(false);
//       form.resetFields();
//     }
//   };

//   const handleAssignPermissions = async (values) => {
//     const { subAdminId } = permModal.subAdmin;
//     const modulePermissions = values.permissions.map((p) => ({
//       module: p.module,
//       actions: p.actions,
//     }));

//     const result = await dispatch(assignPermissions({ subAdminId, modulePermissions }));
//     if (result.meta.requestStatus === 'fulfilled') {
//       message.success('Permissions assigned');
//       setPermModal({ open: false, subAdmin: null });
//       permForm.resetFields();
//     }
//   };

//   const openPermissionModal = async (subAdmin) => {
//     await dispatch(fetchSubAdminPermissions(subAdmin.id));
//     setPermModal({ open: true, subAdmin });
//   };

//   const columns = [
//     {
//       title: 'Name',
//       dataIndex: 'name',
//       key: 'name',
//     },
//     {
//       title: 'Email',
//       dataIndex: 'email',
//       key: 'email',
//     },
//     {
//       title: 'Mobile',
//       dataIndex: 'mobileNumber',
//       key: 'mobileNumber',
//     },
//     {
//       title: 'District',
//       dataIndex: 'district',
//       key: 'district',
//     },
//     {
//       title: 'Permissions',
//       key: 'permissions',
//       render: (_, record) => {
//         const perms = permissions[record.id]?.modulePermissions || [];
//         return (
//           <div className="flex flex-wrap gap-1">
//             {perms.slice(0, 2).map((p, i) => (
//               <Tag key={i} color="blue">
//                 {p.module}: {p.actions.join(', ')}
//               </Tag>
//             ))}
//             {perms.length > 2 && <Tag>...</Tag>}
//           </div>
//         );
//       },
//     },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (_, record) => (
//         <div className="flex gap-2">
//           <Button
//             size="small"
//             icon={<Shield className="w-4 h-4" />}
//             onClick={() => openPermissionModal(record)}
//           >
//             Permissions
//           </Button>
//           <Button
//             danger
//             size="small"
//             icon={<Trash2 className="w-4 h-4" />}
//             onClick={() => {
//               Modal.confirm({
//                 title: 'Delete Sub-Admin?',
//                 content: `Delete ${record.name}?`,
//                 onOk: () => dispatch(deleteSubAdmin(record.id)),
//               });
//             }}
//           />
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="p-4 md:p-6 lg:p-8">
//       <Card
//         title={
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-semibold flex items-center gap-2">
//               <UserCheck className="w-6 h-6" /> Sub-Admin Management
//             </h2>
//             <Button
//               type="primary"
//               icon={<Plus className="w-4 h-4" />}
//               onClick={() => setIsModalOpen(true)}
//             >
//               Create Sub-Admin
//             </Button>
//           </div>
//         }
//       >
//         {loading ? (
//           <div className="flex justify-center py-10">
//             <Spin size="large" />
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <Table
//   columns={columns}
//   dataSource={list}
//   rowKey="id"
//   pagination={{ pageSize: 10 }}
//   className="mt-4"
//   scroll={{ x: 'max-content' }}
// />

//           </div>
//         )}
//       </Card>

//       {/* Create Sub-Admin Modal */}
//       <Modal
//         title="Create New Sub-Admin"
//         open={isModalOpen}
//         onCancel={() => setIsModalOpen(false)}
//         footer={null}
//       >
//         <Form form={form} layout="vertical" onFinish={handleCreate}>
//           <Form.Item name="name" label="Name" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item name="mobileNumber" label="Mobile" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item name="district" label="District" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item name="address" label="Address">
//             <Input.TextArea />
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit" loading={creating} block>
//               Create
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>

//       {/* Assign Permissions Modal */}
//       <Modal
//         title={`Assign Permissions: ${permModal.subAdmin?.name}`}
//         open={permModal.open}
//         onCancel={() => setPermModal({ open: false, subAdmin: null })}
//         footer={null}
//         width={700}
//       >
//         <Form form={permForm} onFinish={handleAssignPermissions}>
//           <Form.List name="permissions">
//             {(fields, { add, remove }) => (
//               <>
//                 {fields.map(({ key, name, ...restField }) => (
//                   <div key={key} className="flex gap-2 items-end mb-3 border-b pb-3">
//                     <Form.Item
//                       {...restField}
//                       name={[name, 'module']}
//                       className="flex-1"
//                       rules={[{ required: true }]}
//                     >
//                       <Select placeholder="Module">
//                         {modules.map((m) => (
//                           <Option key={m} value={m}>{m}</Option>
//                         ))}
//                       </Select>
//                     </Form.Item>
//                     <Form.Item
//                       {...restField}
//                       name={[name, 'actions']}
//                       className="flex-1"
//                       rules={[{ required: true }]}
//                     >
//                       <Select mode="multiple" placeholder="Actions">
//                         {actions.map((a) => (
//                           <Option key={a} value={a}>{a}</Option>
//                         ))}
//                       </Select>
//                     </Form.Item>
//                     <Button danger onClick={() => remove(name)} icon={<Trash2 className="w-4 h-4" />} />
//                   </div>
//                 ))}
//                 <Button type="dashed" onClick={() => add()} block icon={<Plus className="w-4 h-4" />}>
//                   Add Permission
//                 </Button>
//               </>
//             )}
//           </Form.List>
//           <div className="mt-6">
//             <Button type="primary" htmlType="submit" block>
//               Assign Permissions
//             </Button>
//           </div>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default SubAdminManagement;



// src/pages/SubAdminManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubAdmins,
  createSubAdmin,
  deleteSubAdmin,
  fetchSubAdminPermissions,
  assignPermissions,
} from '../../redux/slices/subAdminSlice';
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Spin,
} from 'antd';
import { Shield, Trash2 } from 'lucide-react';

const { Option } = Select;

const modules = ['PROPERTY', 'ADVERTISEMENT', 'FRANCHISEE', 'USER', 'SELLER'];
const actions = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'];

const SubAdminManagement = () => {
  const dispatch = useDispatch();
  const { list, loading, permissions } = useSelector(
    (state) => state.subAdmin
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permModal, setPermModal] = useState({ open: false, subAdmin: null });

  const [form] = Form.useForm();
  const [permForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchSubAdmins());
  }, [dispatch]);

  // ✅ safe array
  const subAdmins = Array.isArray(list)
    ? list
    : list?.content || list?.data || [];

  const handleCreate = async (values) => {
    const res = await dispatch(createSubAdmin(values));
    if (res.meta.requestStatus === 'fulfilled') {
      message.success('Sub-Admin created successfully');
      setIsModalOpen(false);
      form.resetFields();
      dispatch(fetchSubAdmins());
    }
  };

  const openPermissionModal = async (subAdmin) => {
    await dispatch(fetchSubAdminPermissions(subAdmin.id));
    setPermModal({ open: true, subAdmin });
  };

  const handleAssignPermissions = async (values) => {
    const payload = {
      subAdminId: permModal.subAdmin.id,
      modulePermissions: values.permissions,
    };

    const res = await dispatch(assignPermissions(payload));
    if (res.meta.requestStatus === 'fulfilled') {
      message.success('Permissions assigned');
      setPermModal({ open: false, subAdmin: null });
      permForm.resetFields();
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md', 'lg'],
    },
    {
      title: 'Mobile',
      dataIndex: 'mobileNumber',
      key: 'mobileNumber',
      responsive: ['sm', 'md', 'lg'],
    },
    {
      title: 'District',
      dataIndex: 'district',
      key: 'district',
      responsive: ['md', 'lg'],
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, record) => {
        const perms =
          permissions?.[record.id]?.modulePermissions || [];
        return (
          <div className="flex flex-wrap gap-1">
            {perms.slice(0, 2).map((p, i) => (
              <Tag key={i} color="blue">
                {p.module}: {p.actions.join(', ')}
              </Tag>
            ))}
            {perms.length > 2 && <Tag>...</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="small"
            icon={<Shield className="w-4 h-4" />}
            onClick={() => openPermissionModal(record)}
          >
            Permissions
          </Button>
          <Button
            danger
            size="small"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() =>
              Modal.confirm({
                title: 'Delete Sub-Admin?',
                content: `Delete ${record.name}?`,
                onOk: () => dispatch(deleteSubAdmin(record.id)),
              })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">
          Sub-Admin Management
        </h2>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          + Add Sub-Admin
        </Button>
      </div>

      {/* TABLE */}
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={subAdmins}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }} // ✅ mobile horizontal scroll
        />
      </Spin>

      {/* CREATE MODAL */}
      <Modal
        title="Create Sub-Admin"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Name" required>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" required>
            <Input />
          </Form.Item>
          <Form.Item name="mobileNumber" label="Mobile" required>
            <Input />
          </Form.Item>
          <Form.Item name="district" label="District">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Create
          </Button>
        </Form>
      </Modal>

      {/* PERMISSION MODAL */}
      <Modal
        title="Assign Permissions"
        open={permModal.open}
        onCancel={() =>
          setPermModal({ open: false, subAdmin: null })
        }
        footer={null}
        centered
        width={window.innerWidth < 640 ? '100%' : 600}
      >
        <Form
          form={permForm}
          layout="vertical"
          onFinish={handleAssignPermissions}
        >
          <Form.List name="permissions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row gap-2 mb-2"
                  >
                    <Form.Item name={[name, 'module']} className="flex-1">
                      <Select placeholder="Module">
                        {modules.map((m) => (
                          <Option key={m} value={m}>
                            {m}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item name={[name, 'actions']} className="flex-1">
                      <Select mode="multiple" placeholder="Actions">
                        {actions.map((a) => (
                          <Option key={a} value={a}>
                            {a}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>
                      X
                    </Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  + Add Permission
                </Button>
              </>
            )}
          </Form.List>

          <Button
            type="primary"
            htmlType="submit"
            block
            className="mt-4"
          >
            Save Permissions
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default SubAdminManagement;
