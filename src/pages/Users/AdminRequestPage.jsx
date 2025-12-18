import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Avatar, Tag, Space, message, Input, Spin } from 'antd';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import dayjs from 'dayjs';
import {
  fetchPendingRoleRequests,
  processRoleRequest,
} from '../../redux/slices/roleRequestSlice';

const MySwal = withReactContent(Swal);

const AdminRequestPage = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.roleRequests);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchPendingRoleRequests({ page: 0, size: 50 }));
  }, [dispatch]);

const handleProcess = (id, status) => {
  const isApproved = status === 'APPROVED';

  MySwal.fire({
    title: `${isApproved ? 'Approve' : 'Reject'} Request`,
    input: 'textarea',
    inputLabel: 'Comment',
    inputPlaceholder: `Enter a reason for ${isApproved ? 'approval' : 'rejection'}...`,
    inputValue: isApproved
      ? 'Approved after verification'
      : 'Rejected after verification',
    inputAttributes: {
      'aria-label': 'Type your message here',
    },
    showCancelButton: true,
    confirmButtonText: `Yes, ${isApproved ? 'Approve' : 'Reject'}`,
    cancelButtonText: 'Cancel',
    preConfirm: (comment) => {
      if (!comment || comment.trim().length < 3) {
        Swal.showValidationMessage('Please enter a valid comment');
      }
      return comment;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      dispatch(processRoleRequest({ requestId: id, status, comment: result.value }))
        .unwrap()
        .then(() => {
          message.success(`Request ${status.toLowerCase()}ed successfully.`);
          dispatch(fetchPendingRoleRequests({ page: 0, size: 50 }));
        })
        .catch((err) => message.error(err));
    }
  });
};



  const filteredList = list.filter((req) => {
    const user = req.user || {};
    const keyword = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      req.requestedRole?.toLowerCase().includes(keyword)
    );
  });

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <Space>
          <Avatar src={user?.profileImageUrl} alt={user?.name} />
          <div>
            <div className="font-medium">{user?.name}</div>
            <div className="text-gray-500 text-sm">{user?.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Requested Role',
      dataIndex: 'requestedRole',
      key: 'requestedRole',
      render: (role) => <Tag color="blue">{role}</Tag>,
      sorter: (a, b) => a.requestedRole.localeCompare(b.requestedRole),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (role) => role
    
    },
    {  
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleProcess(record.id, 'APPROVED')} type="primary" size="small">
            Approve
          </Button>
          <Button onClick={() => handleProcess(record.id, 'REJECTED')} danger size="small">
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pending Role Requests</h2>
        <Input
          placeholder="Search user or role..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <Spin fullscreen />
      ) : (
        <Table
          dataSource={filteredList}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: true }}
        />
      )}
    </div>
  );
};

export default AdminRequestPage;
