// src/pages/SubAdminManagement.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubAdmins,
  createSubAdmin,
  fetchSubAdminById,
  updateSubAdminPermissions,
  deleteSubAdmin,

  deleteModulePermission,
  clearError,

  // Advertisement thunks (from your slice)
  fetchAllAdvertisements,
  fetchAdvertisementById,
  createAdvertisement,
  deleteAdvertisement,
} from '../../redux/slices/subAdminSlice';
import {
  Button, Table, Modal, Form, Input, Select, Tag, message, Spin, Card,
  Space, Empty, Typography, Popconfirm, Divider, Tooltip, Row, Col, Image, DatePicker, Upload, Alert
} from 'antd';
import {
  ReloadOutlined, UserAddOutlined, CloseOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, LockOutlined, ProfileOutlined, BulbOutlined, PlusOutlined, UserOutlined, CheckCircleOutlined, StopOutlined, DeleteOutlined,
  ExclamationCircleOutlined, EyeOutlined, EditOutlined, FileAddOutlined, UploadOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Text, Title } = Typography;
const { Option } = Select;

// Only 3 Modules
const MODULES = ['PROPERTY', 'ADVERTISEMENT', 'FRANCHISEE'];

const MODULE_ACTIONS = {
  PROPERTY: ['VIEW', 'UPDATE'],
  ADVERTISEMENT: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  FRANCHISEE: ['VIEW', 'UPDATE'],
};

const ACTION_COLORS = {
  VIEW: 'green',
  CREATE: 'blue',
  UPDATE: 'orange',
  DELETE: 'red',
};

/**
 * Utility: normalize permission payloads coming from API.
 * Accepts multiple shapes (grouped, flat, or object with modulePermissions).
 */
const normalizeModulePermissions = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload) && payload.length > 0 && payload[0].module && Array.isArray(payload[0].actions)) {
    return payload;
  }
  if (payload.modulePermissions && Array.isArray(payload.modulePermissions)) {
    return normalizeModulePermissions(payload.modulePermissions);
  }
  if (Array.isArray(payload) && payload.length > 0 && payload[0].module && payload[0].action) {
    const grouped = {};
    payload.forEach((r) => {
      if (!grouped[r.module]) grouped[r.module] = new Set();
      grouped[r.module].add(r.action);
    });
    return Object.entries(grouped).map(([module, actionsSet]) => ({ module, actions: Array.from(actionsSet) }));
  }
  return [];
};

const SubAdminManagement = () => {
  const dispatch = useDispatch();
  const {
    list = [], loading = false, creating = false, updating = false, permissions = {}, error,
    // advertisement state from slice
    advertisements = [], currentAdvertisement = null, advLoading = false, advCreating = false,
  } = useSelector((state) => state.subAdmin || {});

  // Get current user (try common places)
  const auth = useSelector((s) => s.auth || {});
  const currentUser = auth.currentUser || auth.user || auth.profile || null;

  // Determine role & id for current user
  const currentUserRole = currentUser?.role || currentUser?.roles || (currentUser?.isSubAdmin ? 'SUBADMIN' : null);
  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId || currentUser?.email;

  // Local UI state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [permModal, setPermModal] = React.useState({ open: false, subAdmin: null });
  const [viewModal, setViewModal] = React.useState({ open: false, subAdmin: null, loading: false });

  // Advertisement UI state (local)
  const [adCreateModalOpen, setAdCreateModalOpen] = React.useState(false);
  const [adViewModal, setAdViewModal] = React.useState({ open: false, ad: null, loading: false });
  const [filteredAds, setFilteredAds] = React.useState([]); // ads for currently viewed sub-admin
  const [adForm] = Form.useForm();

  const [form] = Form.useForm();
  const [permForm] = Form.useForm();

  // Load primary data on mount. If sub-admin is logged in, only fetch ads.
  useEffect(() => {
    if (currentUserRole && String(currentUserRole).toUpperCase() === 'SUBADMIN') {
      // If sub-admin, only fetch advertisements
      dispatch(fetchAllAdvertisements());
    } else {
      // Admin: fetch sub-admins and advertisements
      dispatch(fetchSubAdmins());
      dispatch(fetchAllAdvertisements());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentUserRole]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // keep filtered ads when advertisements in store or viewModal changes
  useEffect(() => {
    if (viewModal.subAdmin && Array.isArray(advertisements)) {
      const uid = viewModal.subAdmin.id || viewModal.subAdmin._id || viewModal.subAdmin.email;
      const adsForUser = advertisements.filter((a) => {
        // Use createdBy.id (sample API) to match
        const createdById = a.createdBy?.id || a.createdBy?._id || a.createdBy;
        return createdById && (String(createdById) === String(viewModal.subAdmin.id) || String(createdById) === String(viewModal.subAdmin._id));
      });
      setFilteredAds(adsForUser);
    } else if (currentUserRole && String(currentUserRole).toUpperCase() === 'SUBADMIN' && Array.isArray(advertisements)) {
      // If the logged-in user is a sub-admin, show only their ads
      const createdById = currentUserId;
      const myAds = advertisements.filter((a) => {
        const cb = a.createdBy?.id || a.createdBy?._id || a.createdBy;
        return cb && String(cb) === String(createdById);
      });
      setFilteredAds(myAds);
    } else {
      setFilteredAds([]);
    }
  }, [advertisements, viewModal.subAdmin, currentUserRole, currentUserId]);

  // Create SubAdmin (Admins only)
  const handleCreate = async (values) => {
    const payload = { ...values, mobileNumber: String(values.mobileNumber) };
    const result = await dispatch(createSubAdmin(payload));

    if (createSubAdmin.fulfilled.match(result)) {
      message.success('Sub-Admin created successfully');
      form.resetFields();
      setIsModalOpen(false);
      dispatch(fetchSubAdmins());
    } else {
      message.error(result.payload?.message || 'Failed to create sub-admin');
    }
  };

  // Open Permission Modal
  const openPermissionModal = async (subAdmin) => {
    setPermModal({ open: true, subAdmin });
    permForm.resetFields();

    const res = await dispatch(fetchSubAdminById(subAdmin.id));
    if (fetchSubAdminById.fulfilled.match(res)) {
      const modulePermissions = normalizeModulePermissions(res.payload.modulePermissions || res.payload);
      permForm.setFieldsValue({ permissions: modulePermissions.map((mp) => ({ module: mp.module, actions: mp.actions })) });
    } else {
      permForm.setFieldsValue({ permissions: [] });
    }
  };

  // Open View Modal (shows details + permissions + advertisements)
  const openViewModal = async (subAdmin) => {
    setViewModal({ open: true, subAdmin: { ...subAdmin }, loading: true });
    await dispatch(fetchSubAdminById(subAdmin.id));
    // reload advertisements globally (to make sure latest visible)
    await dispatch(fetchAllAdvertisements());
    setViewModal((s) => ({ ...s, loading: false }));
  };

  // Update Permissions
  const handleUpdatePermissions = async (values) => {
    const { subAdmin } = permModal;
    const modulePermissions = (values.permissions || []).map((p) => ({
      module: p.module,
      actions: p.actions || [],
    }));

    const result = await dispatch(
      updateSubAdminPermissions({ subAdminId: subAdmin.id, modulePermissions })
    );

    if (updateSubAdminPermissions.fulfilled.match(result)) {
      message.success('Permissions updated successfully');
      setPermModal({ open: false, subAdmin: null });
      permForm.resetFields();
      dispatch(fetchSubAdmins());
    } else {
      message.error(result.payload?.message || 'Failed to update permissions');
    }
  };

  // Delete Entire Sub-Admin
  const handleDeleteSubAdmin = (id) => {
    dispatch(deleteSubAdmin(id)).then((action) => {
      if (deleteSubAdmin.fulfilled.match(action)) {
        message.success(action.payload.message || 'Sub-Admin deleted successfully');
        dispatch(fetchSubAdmins());
      } else {
        message.error(action.payload?.message || 'Failed to delete sub-admin');
      }
    });
  };

  // Delete Specific Module Permission
  const handleDeleteModule = (moduleName, subAdminFor = permModal.subAdmin) => {
    if (!subAdminFor || !subAdminFor.id) return;
    dispatch(deleteModulePermission({ subAdminId: subAdminFor.id, module: moduleName }))
      .then((action) => {
        if (deleteModulePermission.fulfilled.match(action)) {
          message.success(action.payload.message || `Permission removed for ${moduleName}`);
          dispatch(fetchSubAdminById(subAdminFor.id));
        } else {
          message.error(action.payload?.message || 'Failed to remove module permission');
        }
      });
  };

  const renderPermissionsTags = (record) => {
    const perms = permissions[record.id]?.modulePermissions || [];
    if (!perms || perms.length === 0) return <Tag color="default">No Permissions</Tag>;

    return (
      <Space wrap size={[6, 6]}>
        {perms.map((p) =>
          p.actions && p.actions.length > 0 ? (
            p.actions.map((act) => (
              <Tag
                key={`${p.module}-${act}`}
                color={ACTION_COLORS[act] || 'default'}
                icon={act === 'VIEW' ? <CheckCircleOutlined /> : act === 'DELETE' ? <StopOutlined /> : null}
              >
                <Text strong style={{ marginRight: 6 }}>{p.module}</Text>
                <Text>{act}</Text>
              </Tag>
            ))
          ) : (
            <Tag key={p.module} color="volcano">
              {p.module} • <Text delete>No Access</Text>
            </Tag>
          )
        )}
      </Space>
    );
  };

  // --------------------- Advertisement UI handlers ---------------------
  // Open Create Advertisement modal (for the viewed sub-admin OR logged-in subadmin)
  const openAdCreateForSubAdmin = () => {
    adForm.resetFields();
    setAdCreateModalOpen(true);
  };

  // Helper to prevent Upload from auto uploading and to store file in form
  const beforeUpload = (file) => {
    // prevent auto upload
    return false;
  };

  // Permission helper: checks if given permission exists for a user (sub-admin)
  // tries: 1) permissions object in state keyed by id; 2) currentUser.permissions
  const hasPermission = (module, action, targetUserId = currentUserId) => {
    if (!module) return false;
    // 1) check global permissions state keyed by id
    const permsForUser = permissions?.[targetUserId]?.modulePermissions || permissions?.[targetUserId] || null;
    if (permsForUser && Array.isArray(permsForUser)) {
      const mp = permsForUser.find((m) => String(m.module).toUpperCase() === String(module).toUpperCase());
      if (mp && Array.isArray(mp.actions)) {
        return mp.actions.includes(action);
      }
    }
    // 2) check currentUser.permissions (if logged-in)
    const cuPerms = currentUser?.permissions || currentUser?.modulePermissions || [];
    if (Array.isArray(cuPerms)) {
      const mp = cuPerms.find((m) => String(m.module).toUpperCase() === String(module).toUpperCase());
      if (mp && Array.isArray(mp.actions)) {
        return mp.actions.includes(action);
      }
    }
    // fallback: if currentUser is ADMIN, allow everything
    if (currentUserRole && String(currentUserRole).toUpperCase() === 'ADMIN') return true;
    return false;
  };

  // Create advertisement (multipart)
  const handleCreateAdvertisement = async (values) => {
    try {
      const formData = new FormData();

      // ---- Text / number fields ------------------------------------------------
      const textFields = [
        'title', 'description', 'websiteUrl', 'whatsappNumber', 'phoneNumber',
        'emailAddress', 'instagramUrl', 'facebookUrl', 'youtubeUrl',
        'additionalInfo', 'targetLocation', 'latitude', 'longitude',
        'radiusKm', 'districtName', 'districtId', 'targetDistrictIds',
      ];

      textFields.forEach((key) => {
        if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
          formData.append(key, values[key]);
        }
      });

      // ---- Dates (will be sent as headers) ------------------------------------
      if (values.validFrom) {
        formData.append('validFrom', values.validFrom.toISOString());
      }
      if (values.validUntil) {
        formData.append('validUntil', values.validUntil.toISOString());
      }

      // ---- Banner image --------------------------------------------------------
      if (values.bannerImage?.file?.originFileObj) {
        formData.append('bannerImage', values.bannerImage.file.originFileObj);
      }

      // ---- (Optional) video ----------------------------------------------------
      // if (values.videoFile?.file?.originFileObj) {
      //   formData.append('videoFile', values.videoFile.file.originFileObj);
      // }

      const result = await dispatch(createAdvertisement(formData));

      if (createAdvertisement.fulfilled.match(result)) {
        message.success('Advertisement created successfully!');
        adForm.resetFields();
        setAdCreateModalOpen(false);
        dispatch(fetchAllAdvertisements());
      } else {
        message.error(result.payload?.message || 'Failed to create advertisement');
      }
    } catch (err) {
      console.error(err);
      message.error('An unexpected error occurred');
    }
  };

  // View a single advertisement (open modal)
  const openAdView = async (adId) => {
    setAdViewModal({ open: true, ad: null, loading: true });
    const res = await dispatch(fetchAdvertisementById(adId));
    if (fetchAdvertisementById.fulfilled.match(res)) {
      setAdViewModal({ open: true, ad: res.payload, loading: false });
    } else {
      setAdViewModal({ open: false, ad: null, loading: false });
      message.error(res.payload?.message || 'Failed to load advertisement');
    }
  };

  // Delete advertisement
  const handleDeleteAdvertisement = (adId) => {
    dispatch(deleteAdvertisement(adId)).then((action) => {
      if (deleteAdvertisement.fulfilled.match(action)) {
        message.success(action.payload.message || 'Advertisement deleted');
        dispatch(fetchAllAdvertisements());
      } else {
        message.error(action.payload?.message || 'Failed to delete advertisement');
      }
    });
  };

  // --------------------- Table columns for Admin view ---------------------
  const adminColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, r) => <Text strong>{r.name || '—'}</Text>,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    { title: 'Email', dataIndex: 'email', render: (t) => t || '—' },
    { title: 'Mobile', render: (_, r) => r.mobileNumber || r.phoneNumber || '—' },
    // {
    //   title: (
    //     <div>
    //       <Text strong>Permissions</Text>
    //       <div style={{ fontSize: 12, color: '#8c8c8c' }}>Module • Action</div>
    //     </div>
    //   ),
    //   key: 'permissions',
    //   render: renderPermissionsTags,
    //   width: 420,
    // },
    {
      title: 'Actions',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space>
          <Tooltip title="View details">
            <Button type="default" size="small" icon={<EyeOutlined />} onClick={() => openViewModal(record)}>
              View
            </Button>
          </Tooltip>

          <Tooltip title="Update permissions">
            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openPermissionModal(record)}>
              Update Permissions
            </Button>
          </Tooltip>

          <Popconfirm
            title="Delete Sub-Admin?"
            description="This action cannot be undone."
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleDeleteSubAdmin(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --------------------- Advertisement columns (used for both admin viewing a sub-admin's ads and sub-admin self view) ---------------------
  const advertisementColumns = [
    {
      title: 'Banner',
      dataIndex: 'bannerImageUrl',
      render: (url) => url ? <Image src={url} width={120} height={60} style={{ objectFit: 'cover' }} /> : <Tag>No Image</Tag>,
      width: 140,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      render: (t) => t || '—',
      width: 180,
    },
    { title: 'Target Location', dataIndex: 'targetLocation', render: (t) => t || '—' },
    {
      title: 'Valid From',
      dataIndex: 'validFrom',
      render: (v) => v ? moment(v).format('YYYY-MM-DD HH:mm') : '—'
    },
    {
      title: 'Valid Until',
      dataIndex: 'validUntil',
      render: (v) => v ? moment(v).format('YYYY-MM-DD HH:mm') : '—'
    },
    {
      title: 'Actions',
      key: 'ad_actions',
      width: 220,
      render: (_, record) => (
        <Space>
          {hasPermission('ADVERTISEMENT', 'VIEW', currentUserId) ? (
            <Button size="small" onClick={() => openAdView(record.id)}>View</Button>
          ) : (
            <Tooltip title="No view permission"><Button size="small" disabled>View</Button></Tooltip>
          )}

          {hasPermission('ADVERTISEMENT', 'DELETE', currentUserId) ? (
            <Popconfirm title="Delete advertisement?" onConfirm={() => handleDeleteAdvertisement(record.id)}>
              <Button danger size="small">Delete</Button>
            </Popconfirm>
          ) : (
            <Tooltip title="No delete permission"><Button danger size="small" disabled>Delete</Button></Tooltip>
          )}
        </Space>
      )
    }
  ];

  // If logged-in user is a sub-admin, render the simplified Advertisement-only UI
  if (currentUserRole && String(currentUserRole).toUpperCase() === 'SUBADMIN') {
    return (
      <div style={{ padding: 28, background: '#f5f7fb', minHeight: '100vh' }}>
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <UserOutlined style={{ fontSize: 26, color: '#096dd9' }} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>Advertisements</Title>
                  <div style={{ color: '#8c8c8c', fontSize: 13 }}>Create, view and manage your advertisements</div>
                </div>
              </Space>

              <Space>
                <Button type="default" onClick={() => dispatch(fetchAllAdvertisements())}>Refresh</Button>

                {hasPermission('ADVERTISEMENT', 'CREATE', currentUserId) ? (
                  <Button type="primary" size="large" icon={<FileAddOutlined />} onClick={openAdCreateForSubAdmin}>
                    Create Advertisement
                  </Button>
                ) : (
                  <Tooltip title="No permission to create advertisement">
                    <Button type="primary" size="large" icon={<FileAddOutlined />} disabled>
                      Create Advertisement
                    </Button>
                  </Tooltip>
                )}
              </Space>
            </div>
          }
          style={{ borderRadius: 12, boxShadow: '0 6px 18px rgba(9,45,66,0.06)' }}
        >
          {advLoading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={advertisementColumns}
              dataSource={filteredAds}
              rowKey={(r) => r.id || r._id}
              pagination={{ pageSize: 8 }}
              bordered={false}
              style={{ background: 'white' }}
            />
          )}
        </Card>

        {/* Create Advertisement Modal */}
        <Modal
          title={<Text strong>Create Advertisement</Text>}
          open={adCreateModalOpen}
          onCancel={() => setAdCreateModalOpen(false)}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Form
            form={adForm}
            layout="vertical"
            onFinish={handleCreateAdvertisement}
            initialValues={{
              title: '',
              description: '',
              websiteUrl: '',
              whatsappNumber: '',
              phoneNumber: '',
              emailAddress: '',
              targetLocation: '',
              latitude: '',
              longitude: '',
              radiusKm: '',
              districtName: '',
              districtId: '',
              targetDistrictIds: [],
              validFrom: null,
              validUntil: null,
            }}
          >
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                  <Input placeholder="Advertisement title" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="websiteUrl" label="Website URL">
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="whatsappNumber" label="WhatsApp Number">
                  <Input placeholder="+91..." />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="phoneNumber" label="Phone Number">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="emailAddress" label="Email">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="targetLocation" label="Target Location">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="districtName" label="District Name">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="districtId" label="District ID">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="latitude" label="Latitude">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="longitude" label="Longitude">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="radiusKm" label="Radius (km)">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="validFrom" label="Valid From">
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                    onChange={(value) => {
                      // store moment in form, we'll convert to ISO in submit
                      adForm.setFieldsValue({ validFrom: value });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="validUntil" label="Valid Until">
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                    onChange={(value) => {
                      adForm.setFieldsValue({ validUntil: value });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="bannerImage" label="Banner Image (file)">
                  <Upload beforeUpload={beforeUpload} maxCount={1} accept="image/*">
                    <Button icon={<UploadOutlined />}>Select Image</Button>
                  </Upload>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Upload image to be used as banner.</Text>
                  </div>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="additionalInfo" label="Additional Info">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setAdCreateModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={advCreating}>Create Advertisement</Button>
              </Space>
            </div>
          </Form>
        </Modal>

        {/* Advertisement View Modal */}
        <Modal
          title={<Text strong>Advertisement Details</Text>}
          open={adViewModal.open}
          onCancel={() => setAdViewModal({ open: false, ad: null, loading: false })}
          footer={null}
          width={800}
        >
          {adViewModal.loading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
          ) : adViewModal.ad ? (
            <div>
              <Row gutter={12}>
                <Col span={12}>
                  {adViewModal.ad.bannerImageUrl ? (
                    <Image src={adViewModal.ad.bannerImageUrl} alt="banner" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                  ) : <Tag>No Banner</Tag>}
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Text strong>Title:</Text>
                    <Text>{adViewModal.ad.title}</Text>

                    <Text strong>Website URL:</Text>
                    <a href={adViewModal.ad.websiteUrl || '#'} target="_blank" rel="noreferrer">{adViewModal.ad.websiteUrl}</a>

                    <Text strong>Contact:</Text>
                    <div>
                      <div>WhatsApp: {adViewModal.ad.whatsappNumber}</div>
                      <div>Phone: {adViewModal.ad.phoneNumber}</div>
                      <div>Email: {adViewModal.ad.emailAddress}</div>
                    </div>

                    <Text strong>Target Location:</Text>
                    <Text>{adViewModal.ad.targetLocation}</Text>

                    <Text strong>Valid From / Until:</Text>
                    <div>
                      <div>{adViewModal.ad.validFrom ? new Date(adViewModal.ad.validFrom).toLocaleString() : '—'}</div>
                      <div>{adViewModal.ad.validUntil ? new Date(adViewModal.ad.validUntil).toLocaleString() : '—'}</div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider />

              <div>
                <Text strong>Description:</Text>
                <div style={{ marginTop: 6 }}>{adViewModal.ad.description}</div>
              </div>

              <Divider />

              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setAdViewModal({ open: false, ad: null, loading: false })}>Close</Button>
                  {hasPermission('ADVERTISEMENT', 'DELETE', currentUserId) ? (
                    <Popconfirm title="Delete this advertisement?" onConfirm={() => { handleDeleteAdvertisement(adViewModal.ad.id); setAdViewModal({ open: false, ad: null, loading: false }); }}>
                      <Button danger>Delete</Button>
                    </Popconfirm>
                  ) : null}
                </Space>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Tag>No advertisement data</Tag>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // Default (Admin) view - full management UI
  return (
    <div style={{ padding: 32, background: '#f0f2f5', minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Card
        headStyle={{ borderBottom: 'none', padding: '24px 32px' }}
        bodyStyle={{ padding: '32px' }}
        style={{
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          background: '#fff',
          overflow: 'hidden',
        }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size={16}>
              <div style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
              }}>
                <UserOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>Sub-Admin Management</Title>
                <Text type="secondary" style={{ fontSize: 14 }}>Create, view and assign module permissions with granular control</Text>
              </div>
            </Space>

            <Space size={12}>
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={() => {
                  dispatch(fetchSubAdmins());
                  // dispatch(fetchAllAdvertisements());
                }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(24, 144, 255, 0.25)' }}
                onClick={() => setIsModalOpen(true)}
              >
                Create Sub-Admin
              </Button>
            </Space>
          </div>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" tip="Loading sub-admins..." />
          </div>
        ) : (
          <Table
            columns={adminColumns}
            dataSource={list}
            rowKey={(r) => r.id || r._id || r.email}
            pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
            bordered={false}
            rowHoverable
            style={{ marginTop: 8 }}
            rowClassName="editable-row"
            className="modern-table"
          />
        )}
      </Card>

      {/* ==================== Create Sub-Admin Modal ==================== */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            <UserAddOutlined style={{ marginRight: 10 }} />
            Create New Sub-Admin
          </Title>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={680}
        destroyOnClose
        closeIcon={<CloseOutlined style={{ fontSize: 18 }} />}
        bodyStyle={{ padding: '32px' }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} size="large" preserve={false}>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#aaa' }} />} placeholder="John Doe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[{ required: true, type: 'email', message: 'Valid email required' }]}
              >
                <Input prefix={<MailOutlined style={{ color: '#aaa' }} />} placeholder="john@company.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item
                name="mobileNumber"
                label="Mobile Number"
                rules={[{ required: true, message: '10-digit number required' }]}
              >
                <Input prefix={<PhoneOutlined style={{ color: '#aaa' }} />} placeholder="98xxxxxxxx" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="district" label="District" rules={[{ required: true, message: 'District is required' }]}>
                <Input prefix={<EnvironmentOutlined style={{ color: '#aaa' }} />} placeholder="e.g. Mumbai Suburban" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Full Address (Optional)">
            <Input.TextArea rows={3} placeholder="House no., street, landmark..." />
          </Form.Item>

          <Divider style={{ margin: '32px 0 24px' }} />

          <div style={{ textAlign: 'right' }}>
            <Space size={12}>
              <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={creating}
                size="large"
                style={{ minWidth: 140 }}
              >
                {creating ? 'Creating...' : 'Create Sub-Admin'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* ==================== Permissions Modal ==================== */}
      <Modal
        title={<Title level={4}><LockOutlined style={{ marginRight: 10, color: '#1890ff' }} /> Permissions — {permModal.subAdmin?.name || ''}</Title>}
        open={permModal.open}
        onCancel={() => { setPermModal({ open: false, subAdmin: null }); permForm.resetFields(); }}
        footer={null}
        width={1000}
        destroyOnClose
        bodyStyle={{ padding: '32px' }}
      >
        <Form form={permForm} onFinish={handleUpdatePermissions} preserve={false}>
          <Form.List name="permissions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '16px',
                    background: '#fafafa',
                    borderRadius: 12,
                    marginBottom: 16,
                    border: '1px solid #f0f0f0',
                  }}>
                    <Form.Item {...restField} name={[name, 'module']} rules={[{ required: true, message: 'Select module' }]} style={{ marginBottom: 0, minWidth: 240 }}>
                      <Select
                        placeholder="Select Module"
                        size="large"
                        onChange={() => {
                          permForm.setFieldsValue({
                            permissions: permForm.getFieldValue('permissions').map((p, i) =>
                              i === name ? { ...p, actions: [] } : p
                            ),
                          });
                        }}
                      >
                        {MODULES.map((m) => (
                          <Option key={m} value={m}>
                            {m == "PROPERTY" && (
                              <Tag color="purple" style={{ marginRight: 6 }}>
                                PROPERTY UPDATE REQ
                              </Tag>
                            )}
                            <strong>{m}</strong>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item {...restField} name={[name, 'actions']} style={{ marginBottom: 0, flex: 1 }}>
                      <Select
                        mode="multiple"
                        placeholder="Choose actions (leave empty = revoke all)"
                        size="large"
                        allowClear
                        tagRender={(props) => {
                          const { label } = props;
                          return <Tag color={ACTION_COLORS[label] || 'blue'}>{label}</Tag>;
                        }}
                      >
                        {(() => {
                          const selectedModule = permForm.getFieldValue(['permissions', name, 'module']);
                          const allowed = MODULE_ACTIONS[selectedModule] || [];
                          return allowed.map((act) => (
                            <Option key={act} value={act}>
                              <Tag color={ACTION_COLORS[act]}>{act}</Tag>
                            </Option>
                          ));
                        })()}
                      </Select>
                    </Form.Item>

                    <Space direction="vertical">
                      <Button danger size="middle" onClick={() => remove(name)}>Remove Row</Button>
                      <Popconfirm
                        title="Permanently delete this module permission?"
                        onConfirm={() => {
                          const mod = permForm.getFieldValue(['permissions', name, 'module']);
                          if (mod) handleDeleteModule(mod);
                          remove(name);
                        }}
                      >
                        <Button type="primary" danger icon={<DeleteOutlined />}>Delete Module</Button>
                      </Popconfirm>
                    </Space>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  size="large"
                  style={{ height: 48, borderRadius: 10 }}
                >
                  Add Module Permission
                </Button>
              </>
            )}
          </Form.List>

          <Divider style={{ margin: '40px 0 24px' }} />

          <div style={{ textAlign: 'right' }}>
            <Space size={12}>
              <Button onClick={() => { setPermModal({ open: false, subAdmin: null }); permForm.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={updating} size="large" style={{ minWidth: 160 }}>
                {updating ? 'Saving...' : 'Save Permissions'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* ==================== View Sub-Admin Modal (with Ads) ==================== */}
      <Modal
        title={<Title level={4}><ProfileOutlined style={{ marginRight: 10 }} /> Sub-Admin Details</Title>}
        open={viewModal.open}
        onCancel={() => setViewModal({ open: false, subAdmin: null, loading: false })}
        footer={null}
        width={1100}
        bodyStyle={{ padding: '32px' }}
      >
        {viewModal.loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
        ) : viewModal.subAdmin ? (
          <Row gutter={32}>
            <Col span={10}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <Space direction="vertical" size={18} style={{ width: '100%' }}>
                  <div><Text strong>Name:</Text> <Text>{viewModal.subAdmin.name || '—'}</Text></div>
                  <div><Text strong>Email:</Text> <Text>{viewModal.subAdmin.email || '—'}</Text></div>
                  <div><Text strong>Mobile:</Text> <Text>{viewModal.subAdmin.mobileNumber || viewModal.subAdmin.phoneNumber || '—'}</Text></div>
                  <div><Text strong>District:</Text> <Text>{viewModal.subAdmin.district || '—'}</Text></div>
                </Space>
              </Card>
            </Col>

            <Col span={14}>
              <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 16 }}>Module Permissions</Text>
              {(permissions[viewModal.subAdmin.id]?.modulePermissions || []).length === 0 ? (
                <Alert message="No permissions assigned yet" type="info" showIcon />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  {(permissions[viewModal.subAdmin.id]?.modulePermissions || []).map((mp) => (
                    <Card key={mp.module} size="small" style={{ borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: 15 }}>{mp.module}</Text>
                          <div style={{ marginTop: 8 }}>
                            {mp.actions.length > 0 ? mp.actions.map(a => (
                              <Tag key={a} color={ACTION_COLORS[a] || 'geekblue'} style={{ marginBottom: 4 }}>{a}</Tag>
                            )) : <Tag color="red">No Access</Tag>}
                          </div>
                        </div>
                        <Space>
                          <Button size="small" type="link" onClick={() => { setViewModal({ open: false, subAdmin: null }); openPermissionModal(viewModal.subAdmin); }}>
                            Edit
                          </Button>
                          <Popconfirm title="Remove this module?" onConfirm={() => handleDeleteModule(mp.module, viewModal.subAdmin)}>
                            <Button danger size="small">Remove</Button>
                          </Popconfirm>
                        </Space>
                      </div>
                    </Card>
                  ))}
                </Space>
              )}
            </Col>
          </Row>
        ) : null}

        <Divider />

        {/* <div style={{ marginTop: 24 }}>
      <Title level={5}><BulbOutlined style={{ marginRight: 8, color: '#faad14' }} /> Advertisements</Title>
      <div style={{ margin: '16px 0' }}>
        <Space>
          {hasPermission('ADVERTISEMENT', 'CREATE', currentUserId) && (
            <Button type="primary" icon={<FileAddOutlined />} size="large" onClick={openAdCreateForSubAdmin}>
              Create Advertisement
            </Button>
          )}
          <Button icon={<ReloadOutlined />} onClick={() => dispatch(fetchAllAdvertisements())}>Refresh</Button>
        </Space>
      </div>

      {filteredAds.length === 0 ? (
        <Empty description="No advertisements created yet" style={{ marginTop: 40 }} />
      ) : (
        <Table
          dataSource={filteredAds}
          rowKey={(a) => a.id || a._id}
          pagination={{ pageSize: 8 }}
          size="middle"
          columns={advertisementColumns}
          style={{ marginTop: 12 }}
        />
      )}
    </div> */}

        <div style={{ marginTop: 32, textAlign: 'right' }}>
          <Button size="large" onClick={() => setViewModal({ open: false, subAdmin: null, loading: false })}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SubAdminManagement;
