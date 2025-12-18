import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Input,
  Select,
  Spin,
  Drawer,
  Descriptions,
  Typography,
  Card,
  Tag,
  Badge,
  Space,
  Tooltip,
  Segmented,
  Avatar,
  Switch,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { gsap } from 'gsap';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchUsers } from '../../redux/slices/userManagementSlice';
import 'antd/dist/reset.css';

const { Option } = Select;
const { Link, Text, Title } = Typography;
const { RangePicker } = DatePicker;

const VERIFY_COLOR = (flag) => (flag ? 'success' : 'default');

const roleTagColor = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'magenta';
    case 'FRANCHISEE':
      return 'geekblue';
    case 'SELLER':
      return 'volcano';
    case 'DEVELOPER':
      return 'gold';
    case 'ADVISOR':
      return 'cyan';
    case 'USER':
    default:
      return 'default';
  }
};

const toCsv = (rows) =>
  rows
    .map((r) =>
      [
        'id',
        'permanentId',
        'name',
        'email',
        'mobileNumber',
        'roles',
        'mobileVerified',
        'emailVerified',
        'aadhaarVerified',
        'createdAt',
        'updatedAt',
        'propertyCount',
        'activePropertyCount',
        'pendingPropertyCount',
        'reelCount',
        'favoriteCount',
        'reviewCount',
        'subscriptionCount',
        'activeSubscriptionCount',
        'chatRoomCount',
        'advertisementCount',
        'roleRequestCount',
        'pendingRoleRequestCount',
        'profileImageUrl',
      ]
        .map((k) => {
          let v = r[k];
          if (k === 'roles' && Array.isArray(v)) v = v.join(', ');
          if (k === 'createdAt' || k === 'updatedAt') {
            v = v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : '';
          }
          if (typeof v === 'boolean') v = v ? 'Yes' : 'No';
          return `"${(v ?? '').toString().replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

const useDebouncedState = (initial, delay = 400) => {
  const [value, setValue] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return [value, setValue, debounced];
};

const StatBox = ({ title, value, suffix, tint = 'default' }) => {
  const palette = {
    default: { bg: 'bg-white', text: 'text-gray-800', sub: 'text-gray-500' },
    cyan: { bg: 'bg-white', text: 'text-cyan-700', sub: 'text-cyan-500' },
    green: { bg: 'bg-white', text: 'text-emerald-700', sub: 'text-emerald-500' },
    amber: { bg: 'bg-white', text: 'text-amber-700', sub: 'text-amber-500' },
    purple: { bg: 'bg-white', text: 'text-purple-700', sub: 'text-purple-500' },
  }[tint];

  return (
    <Card className={`stat-card shadow-sm border border-gray-100`}>
      <div className="flex flex-col gap-1">
        <span className={`text-sm ${palette.sub}`}>{title}</span>
        <span className={`text-2xl font-semibold ${palette.text}`}>
          {value}
          {suffix && <span className="ml-1 text-base">{suffix}</span>}
        </span>
      </div>
    </Card>
  );
};

const UserManagementDashboard = () => {
  const dispatch = useDispatch();
  const { users, totalElements, totalPages, loading, error } = useSelector((s) => s.userManagement);

  // filters / table state
  const [search, setSearch, debouncedSearch] = useDebouncedState('', 500);
  const [roleFilter, setRoleFilter] = useState([]);
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // 'all', 'verified', 'unverified'
  const [dateRange, setDateRange] = useState([null, null]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);


  // UI state
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [density, setDensity] = useState('Comfortable');

  const modalRef = useRef(null);

  // fetch data
  useEffect(() => {
    const params = {
      page,
      size,
      search: debouncedSearch,
      role: roleFilter.join(','),
    };
    if (verifiedFilter !== 'all') {
      params.verified = verifiedFilter === 'verified' ? 'true' : 'false';
    }
    if (dateRange[0]) {
      params.since = dateRange[0].format('YYYY-MM-DD');
    }
    if (dateRange[1]) {
      params.until = dateRange[1].format('YYYY-MM-DD');
    }
    dispatch(fetchUsers(params));
  }, [dispatch, page, size, debouncedSearch, roleFilter, verifiedFilter, dateRange]);

  // toast errors
  useEffect(() => {
    if (error) toast.error(`Error: ${error}`, { position: 'top-right', autoClose: 3000 });
  }, [error]);

  // gentle animations
  useEffect(() => {
    gsap.utils.toArray('.stat-card').forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', delay: i * 0.05 }
      );
    });
  }, [users]);

  useEffect(() => {
    if (viewOpen && modalRef.current) {
      gsap.fromTo(modalRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 });
    }
  }, [viewOpen]);

  const handleView = (record) => {
    setSelectedUser(record);
    setViewOpen(true);
  };

  // console.log('Selected User:', users);
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchMatch =
        !search.trim() ||
        (user.name || '').toLowerCase().includes(search.trim().toLowerCase()) ||
        (user.email || '').toLowerCase().includes(search.trim().toLowerCase()) ||
        (user.mobileNumber || '').includes(search.trim()) ||
        (user.permanentId || '').toLowerCase().includes(search.trim().toLowerCase());

      const roleMatch =
        roleFilter.length == 0 ||
        (user.roles && user.roles?.some(role => roleFilter.includes(role)));

      const dateMatch =
        !dateRange[0] ||
        !dateRange[1] ||
        (
          user.createdAt &&
          new Date(user.createdAt) >= new Date(dateRange[0]) &&
          new Date(user.createdAt) <= new Date(dateRange[1])
        );

      const verificationMatch =
        verifiedFilter === 'all' ||
        (verifiedFilter === 'verified' && user.verified) ||
        (verifiedFilter === 'unverified' && !user.verified);

      return searchMatch && roleMatch && dateMatch && verificationMatch;
    });
  }, [users, search, roleFilter, dateRange, verifiedFilter]);

  const handleDownload = () => {
    try {
      const header =
        'id,permanentId,name,email,mobileNumber,roles,mobileVerified,emailVerified,aadhaarVerified,createdAt,updatedAt,propertyCount,activePropertyCount,pendingPropertyCount,reelCount,favoriteCount,reviewCount,subscriptionCount,activeSubscriptionCount,chatRoomCount,advertisementCount,roleRequestCount,pendingRoleRequestCount,profileImageUrl\n';
      const csv = header + toCsv(users);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded', { autoClose: 2000 });
    } catch (e) {
      toast.error(`Failed to download: ${e.message}`);
    }
  };

  // Derived stats (client-side for quick overview)
  const totalUsers = totalElements || 0;
  const verifiedUsers = users.filter((u) => u.mobileVerified || u.emailVerified).length;
  const activeSubscriptions = users.reduce((acc, u) => acc + (u.activeSubscriptionCount || 0), 0);
  const roleCounts = users.reduce((acc, u) => {
    (u.roles || []).forEach((r) => (acc[r] = (acc[r] || 0) + 1));
    return acc;
  }, {});

  // compact density
  const tableSize = density === 'Compact' ? 'small' : 'middle';

  const columns = useMemo(
    () => [
      {
        title: 'User',
        key: 'user',
        dataIndex: 'name',
        width: 260,
        render: (_, record) => (
          <Space>
            <Avatar
              src={record.profileImageUrl}
              icon={!record.profileImageUrl && <UserOutlined />}
              size={40}
              style={{ backgroundColor: '#EDF2F7' }}
            />
            <div className="flex flex-col">
              <Text strong className="text-gray-800">
                {record.name || 'N/A'}
              </Text>
              <Text type="secondary" className="text-[12px]">
                {record.permanentId || '—'}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        title: 'District',
        key: 'district',
        width: 260,
        render: (_, r) => (
          <div className="flex flex-col">
            <Text className="text-gray-700">{r.district || 'N/A'}</Text>
            <Text type="secondary" className="text-[10px]">
              {r.address || 'N/A'}
            </Text>
          </div>
        ),
      },
      {
        title: 'Contact',
        key: 'contact',
        width: 260,
        render: (_, r) => (
          <div className="flex flex-col">
            <Text className="text-gray-700">{r.mobileNumber}</Text>
            <Text type="secondary" className="text-[12px]">
              {r.email || 'N/A'}
            </Text>
          </div>
        ),
      },
      {
        title: 'Roles',
        dataIndex: 'roles',
        key: 'roles',
        width: 220,
        render: (roles = []) => (
          <Space wrap size={[6, 6]}>
            {roles.map((role) => (
              <Tag key={role} color={roleTagColor(role)}>
                {role}
              </Tag>
            ))}
            {roles.length === 0 && <Tag>USER</Tag>}
          </Space>
        ),
      },
      {
        title: 'Verification',
        key: 'verification',
        width: 200,
        render: (_, r) => (
          <Space size="small" wrap>
            <Tooltip title={`Mobile ${r.mobileVerified ? 'verified' : 'not verified'}`}>
              <Badge
                status={r.mobileVerified ? 'success' : 'default'}
                text={
                  <span className="flex items-center gap-1">
                    {r.mobileVerified ? (
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    ) : (
                      <CloseCircleTwoTone twoToneColor="#bfbfbf" />
                    )}
                    <span className="text-gray-700 text-[12px]">Mobile</span>
                  </span>
                }
              />
            </Tooltip>
            <Tooltip title={`Email ${r.emailVerified ? 'verified' : 'not verified'}`}>
              <Badge
                status={r.emailVerified ? 'success' : 'default'}
                text={
                  <span className="flex items-center gap-1">
                    {r.emailVerified ? (
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    ) : (
                      <CloseCircleTwoTone twoToneColor="#bfbfbf" />
                    )}
                    <span className="text-gray-700 text-[12px]">Email</span>
                  </span>
                }
              />
            </Tooltip>
            <Tooltip title={`Aadhaar ${r.aadhaarVerified ? 'verified' : 'not verified'}`}>
              <Badge
                status={r.aadhaarVerified ? 'success' : 'default'}
                text={
                  <span className="flex items-center gap-1">
                    {r.aadhaarVerified ? (
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    ) : (
                      <CloseCircleTwoTone twoToneColor="#bfbfbf" />
                    )}
                    <span className="text-gray-700 text-[12px]">Aadhaar</span>
                  </span>
                }
              />
            </Tooltip>
          </Space>
        ),
      },
      {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 150,
        render: (date) => (
          <span className="text-gray-700">{date ? moment(date).format('YYYY-MM-DD') : '—'}</span>
        ),
        sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      },
      {
        title: 'Actions',
        key: 'actions',
        // fixed: 'right',
        width: 90,
        render: (_, record) => (
          <Tooltip title="View details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              className="text-cyan-700 hover:text-cyan-900"
            />
          </Tooltip>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
      <Spin spinning={loading}>
        {/* Header */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl mb-5">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex items-center gap-3">
              <Title level={4} style={{ margin: 0 }}>
                User Management
              </Title>
              {/* <Tag color="cyan">v1.0</Tag> */}
            </div>
            <Space wrap>
              {/* <Segmented
                value={density}
                onChange={setDensity}
                options={['Comfortable', 'Compact']}
              /> */}
              <Button icon={<ReloadOutlined />} onClick={() => dispatch(fetchUsers({ page, size, search: debouncedSearch, role: roleFilter.join(','), verified: verifiedFilter === 'all' ? '' : verifiedFilter === 'verified' ? 'true' : 'false', since: dateRange[0]?.format('YYYY-MM-DD'), until: dateRange[1]?.format('YYYY-MM-DD') }))}>
                Refresh
              </Button>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
                Download CSV
              </Button>
            </Space>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatBox title="Total Users" value={totalUsers} tint="cyan" />
          <StatBox title="Verified Users" value={verifiedUsers} tint="green" />
          <StatBox title="Active Subscriptions" value={activeSubscriptions} tint="amber" />
          <StatBox title="Franchisees" value={roleCounts.FRANCHISEE || 0} tint="purple" />
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl mb-5">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            <Input
              allowClear
              placeholder="Search by Name, Email, Mobile, Permanent ID"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="rounded-lg w-full lg:w-[30%]"
            />

            <Select
              mode="multiple"
              allowClear
              maxTagCount="responsive"
              placeholder="Filter by Roles"
              value={roleFilter}
              onChange={(v) => {
                setRoleFilter(v);
                setPage(0);
              }}
              className="w-full lg:w-[25%]"
            >
              <Option value="USER">User</Option>
              <Option value="FRANCHISEE">Franchisee</Option>
              <Option value="SELLER">Seller</Option>
              <Option value="DEVELOPER">Developer</Option>
              <Option value="ADVISOR">Advisor</Option>
              <Option value="ADMIN">Admin</Option>
            </Select>

            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates || [null, null]);
                setPage(0);
              }}
              className="w-full lg:w-[25%]"
              placeholder={['Start Date', 'End Date']}
            />

            <Select
              value={verifiedFilter}
              onChange={(v) => {
                setVerifiedFilter(v);
                setPage(0);
              }}
              className="w-full lg:w-[20%]"
            >
              <Option value="all">All Verification</Option>
              <Option value="verified">Verified Only</Option>
              <Option value="unverified">Unverified Only</Option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 p-0 rounded-xl overflow-hidden">
          <Table
  columns={columns}
  dataSource={filteredUsers}
  rowKey="id"
  size={tableSize}
  pagination={
    filteredUsers.length >= size
      ? {
          current: page + 1,
          pageSize: size,
          total: totalElements || filteredUsers.length,
          onChange: (p) => setPage(p - 1),
          showSizeChanger: false,
          responsive: true,
        }
      : false
  }
  scroll={{ x: 900 }}
  className="users-table"
/>

        </div>

        {/* Details Drawer */}
        <Drawer
          title="User Details"
          placement="right"
          width={Math.min(560, window.innerWidth - 80)}
          onClose={() => setViewOpen(false)}
          open={viewOpen}
          destroyOnClose
        >
          <div ref={modalRef}>
            {selectedUser && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={selectedUser.profileImageUrl}
                    size={56}
                    icon={!selectedUser.profileImageUrl && <UserOutlined />}
                    style={{ backgroundColor: '#EDF2F7' }}
                  />
                  <div>
                    <Text strong className="text-lg">
                      {selectedUser.name}
                    </Text>
                    <div className="mt-1">
                      {(selectedUser.roles || []).map((r) => (
                        <Tag key={r} color={roleTagColor(r)} className="mr-1">
                          {r}
                        </Tag>
                      ))}
                      {(selectedUser.roles || []).length === 0 && <Tag>USER</Tag>}
                    </div>
                  </div>
                </div>

                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
                  <Descriptions.Item label="Permanent ID">{selectedUser.permanentId}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedUser.email || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Mobile">{selectedUser.mobileNumber}</Descriptions.Item>
                  <Descriptions.Item label="Verification">
                    <Space wrap>
                      <Tag color={VERIFY_COLOR(selectedUser.mobileVerified)}>Mobile</Tag>
                      <Tag color={VERIFY_COLOR(selectedUser.emailVerified)}>Email</Tag>
                      <Tag color={VERIFY_COLOR(selectedUser.aadhaarVerified)}>Aadhaar</Tag>
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label="Created">
                    {selectedUser.createdAt ? moment(selectedUser.createdAt).format('YYYY-MM-DD HH:mm:ss') : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Updated">
                    {selectedUser.updatedAt ? moment(selectedUser.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '—'}
                  </Descriptions.Item>

                  <Descriptions.Item label="Property Count">{selectedUser.propertyCount}</Descriptions.Item>
                  <Descriptions.Item label="Active Property Count">
                    {selectedUser.activePropertyCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Pending Property Count">
                    {selectedUser.pendingPropertyCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reel Count">{selectedUser.reelCount}</Descriptions.Item>
                  <Descriptions.Item label="Favorite Count">{selectedUser.favoriteCount}</Descriptions.Item>
                  <Descriptions.Item label="Review Count">{selectedUser.reviewCount}</Descriptions.Item>

                  <Descriptions.Item label="Subscription Count">
                    {selectedUser.subscriptionCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Active Subscription Count">
                    {selectedUser.activeSubscriptionCount}
                  </Descriptions.Item>

                  <Descriptions.Item label="Chat Room Count">{selectedUser.chatRoomCount}</Descriptions.Item>
                  <Descriptions.Item label="Advertisement Count">
                    {selectedUser.advertisementCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Role Request Count">{selectedUser.roleRequestCount}</Descriptions.Item>
                  <Descriptions.Item label="Pending Role Request Count">
                    {selectedUser.pendingRoleRequestCount}
                  </Descriptions.Item>

                  <Descriptions.Item label="Profile Image">
                    {selectedUser.profileImageUrl ? (
                      <Link href={selectedUser.profileImageUrl} target="_blank" rel="noreferrer">
                        View image
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        </Drawer>


        <ToastContainer position="top-right" autoClose={3000} />
      </Spin>

      {/* Tiny Tailwind helpers if not globally loaded (optional) */}
      <style>{`
        .bg-gray-50 { background-color: #F9FAFB; }
        .border-gray-100 { border-color: #F3F4F6; }
      `}</style>
    </div>
  );
};

export default UserManagementDashboard;