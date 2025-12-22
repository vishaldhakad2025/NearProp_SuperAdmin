import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Input, Select, Spin, Modal, Tabs, Descriptions, Typography } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { gsap } from 'gsap';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  fetchWithdrawalReport,
} from '../../redux/slices/franchiseeWithdrawalSlice';
import 'antd/dist/reset.css';

const { Option } = Select;
const { TabPane } = Tabs;
const { Link } = Typography;

const FranchiseeWithdrawal = () => {
  const dispatch = useDispatch();
  const { pending, approved, rejected, loading, error } = useSelector((state) => state.franchiseeWithdrawal);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const [size] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [comments, setComments] = useState('');
  const [paymentReference, setPaymentReference] = useState('NEFT89654123');
  const [transactionType, setTransactionType] = useState('BANK_TRANSFER');
  const [transactionId, setTransactionId] = useState('TXN78965412');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const modalRef = useRef(null);

  const defaultComments = {
    approve: 'Ja Jile Apni Jindegi',
    reject: 'Withdrawal rejected due to insufficient details',
  };

  useEffect(() => {
    dispatch(fetchWithdrawalRequests({ status: 'PENDING', page: page.PENDING, size, search: searchTerm }));
    dispatch(fetchWithdrawalRequests({ status: 'APPROVED', page: page.APPROVED, size, search: searchTerm }));
    dispatch(fetchWithdrawalRequests({ status: 'REJECTED', page: page.REJECTED, size, search: searchTerm }));
  }, [dispatch, page, size, searchTerm]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`, { position: 'top-right', autoClose: 3000 });
    }
  }, [error]);

  useEffect(() => {
    gsap.utils.toArray('.withdrawal-row').forEach((row) => {
      gsap.fromTo(
        row,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 }
      );
    });
    if ((modalVisible || viewModalVisible) && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' }
      );
    }
  }, [pending, approved, rejected, modalVisible, viewModalVisible]);

  const handleAction = (action, record) => {
    setModalAction(action);
    setSelectedRequestId(record.id);
    setComments(defaultComments[action]);
    setPaymentReference(action === 'approve' ? 'NEFT89654123' : '');
    setTransactionType(action === 'approve' ? 'BANK_TRANSFER' : '');
    setTransactionId(action === 'approve' ? 'TXN78965412' : '');
    setModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setViewModalVisible(true);
  };

  const handleModalOk = async () => {
    if (!comments.trim()) {
      toast.error('Comment is required', { position: 'top-right', autoClose: 3000 });
      return;
    }
    if (modalAction === 'approve' && (!paymentReference || !transactionType || !transactionId)) {
      toast.error('All payment fields are required for approval', { position: 'top-right', autoClose: 3000 });
      return;
    }

    try {
      if (modalAction === 'approve') {
        await dispatch(
          approveWithdrawalRequest({
            id: selectedRequestId,
            payload: {
              status: 'APPROVED',
              adminComments: comments,
              paymentReference,
              transactionType,
              transactionId,
            },
          })
        ).unwrap();
        toast.success('Withdrawal request approved successfully', { position: 'top-right', autoClose: 3000 });
      } else if (modalAction === 'reject') {
        await dispatch(
          rejectWithdrawalRequest({
            id: selectedRequestId,
            payload: { status: 'REJECTED', adminComments: comments },
          })
        ).unwrap();
        toast.success('Withdrawal request rejected successfully', { position: 'top-right', autoClose: 3000 });
      }
      setModalVisible(false);
      dispatch(fetchWithdrawalRequests({ status: 'PENDING', page: page.PENDING, size, search: searchTerm }));
      dispatch(fetchWithdrawalRequests({ status: 'APPROVED', page: page.APPROVED, size, search: searchTerm }));
      dispatch(fetchWithdrawalRequests({ status: 'REJECTED', page: page.REJECTED, size, search: searchTerm }));
    } catch (err) {
      toast.error(`Failed to ${modalAction} request: ${err.message}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setComments('');
    setPaymentReference('');
    setTransactionType('');
    setTransactionId('');
    setSelectedRequestId(null);
    setModalAction(null);
  };

  const handleViewModalCancel = () => {
    setViewModalVisible(false);
    setSelectedRequest(null);
  };

  const handleDownloadReport = async () => {
    try {
      const report = await dispatch(fetchWithdrawalReport()).unwrap();
      const csvContent = [
        [
          'Withdrawal ID',
          'Franchisee Name',
          'District',
          'State',
          'Requested Amount',
          'Status',
          'Payment Reference',
          'Transaction Type',
          'Transaction ID',
          'Account Number',
          'Bank Name',
          'IFSC Code',
          'Reason',
          'Processed By',
          'Available Balance',
          'Original Balance',
          'Updated Balance',
          'Screenshot URL',
          'Created At',
          'Updated At',
          'Processed At',
          'Admin Comments',
        ],
        ...report.map((req) => [
          req.id || '',
          req.franchiseeName || '',
          req.districtName || '',
          req.state || '',
          req.requestedAmount || '',
          req.status || '',
          req.paymentReference || '',
          req.transactionType || '',
          req.transactionId || '',
          req.accountNumber || '',
          req.bankName || '',
          req.ifscCode || '',
          req.reason || '',
          req.processedByName || '',
          req.availableBalance || '',
          req.originalBalance || '',
          req.updatedBalance || '',
          req.screenshotUrl || '',
          req.createdAt ? moment(req.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
          req.updatedAt ? moment(req.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
          req.processedAt ? moment(req.processedAt).format('YYYY-MM-DD HH:mm:ss') : '',
          req.adminComments || '',
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'withdrawal_report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Withdrawal report downloaded successfully', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      toast.error(`Failed to download report: ${err.message}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage({ PENDING: 0, APPROVED: 0, REJECTED: 0 });
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value || 'PENDING');
  };

  const pendingColumns = [
    { title: 'Withdrawal ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Franchisee', dataIndex: 'franchiseeName', key: 'franchiseeName', width: 150 },
    { title: 'District', dataIndex: 'districtName', key: 'districtName', width: 120 },
    { title: 'State', dataIndex: 'state', key: 'state', width: 120 },
    { title: 'Amount Requested', dataIndex: 'requestedAmount', key: 'requestedAmount', width: 100 },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', width: 150 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-white text-xs ${
            status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Created On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            className="text-blue-600 hover:text-blue-800"
          />
          <Button
            type="primary"
            size="small"
            onClick={() => handleAction('approve', record)}
            className="bg-green-600 hover:bg-green-700 text-xs"
          >
            Approve
          </Button>
          <Button
            type="primary"
            size="small"
            danger
            onClick={() => handleAction('reject', record)}
            className="text-xs"
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const approvedColumns = [
    { title: 'Withdrawal ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Franchisee', dataIndex: 'franchiseeName', key: 'franchiseeName', width: 150 },
    { title: 'District', dataIndex: 'districtName', key: 'districtName', width: 120 },
    { title: 'State', dataIndex: 'state', key: 'state', width: 120 },
    { title: 'Amount Requested', dataIndex: 'requestedAmount', key: 'requestedAmount', width: 100 },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', width: 150 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span className="px-2 py-1 rounded-full text-white text-xs bg-green-500">{status}</span>
      ),
    },
    {
      title: 'Payment Reference',
      dataIndex: 'paymentReference',
      key: 'paymentReference',
      width: 120,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 120,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 120,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Account Number',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 120,
      render: (text) => text || 'N/A',
    },
    { title: 'Bank Name', dataIndex: 'bankName', key: 'bankName', width: 120, render: (text) => text || 'N/A' },
    { title: 'IFSC Code', dataIndex: 'ifscCode', key: 'ifscCode', width: 120, render: (text) => text || 'N/A' },
    {
      title: 'Processed By',
      dataIndex: 'processedByName',
      key: 'processedByName',
      width: 120,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Processed On',
      dataIndex: 'processedAt',
      key: 'processedAt',
      width: 150,
      render: (date) => (date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          className="text-blue-600 hover:text-blue-800"
        />
      ),
    },
  ];

  const rejectedColumns = [
    { title: 'Withdrawal ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Franchisee', dataIndex: 'franchiseeName', key: 'franchiseeName', width: 150 },
    { title: 'District', dataIndex: 'districtName', key: 'districtName', width: 120 },
    { title: 'State', dataIndex: 'state', key: 'state', width: 120 },
    { title: 'Amount Requested', dataIndex: 'requestedAmount', key: 'requestedAmount', width: 100 },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', width: 150 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span className="px-2 py-1 rounded-full text-white text-xs bg-red-500">{status}</span>
      ),
    },
    {
      title: 'Admin Comments',
      dataIndex: 'adminComments',
      key: 'adminComments',
      width: 150,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Created On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          className="text-blue-600 hover:text-blue-800"
        />
      ),
    },
  ];

  const dataSources = {
    PENDING: pending.content || [],
    APPROVED: approved.content || [],
    REJECTED: rejected.content || [],
  };

  console.log(dataSources);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <Spin spinning={loading}>
        <header className="bg-cyan-800 text-white p-4 rounded-lg shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-0">Franchisee Withdrawal Dashboard</h1>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadReport}
            className="bg-cyan-600 hover:bg-cyan-700 text-xs sm:text-sm"
          >
            Download Report
          </Button>
        </header>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
          {/* <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by Franchisee Name or ID"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-lg w-full sm:w-1/2"
            />
            <Select
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={handleStatusFilter}
              className="w-full sm:w-48"
              allowClear
            >
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>
          </div> */}
          <Tabs
            activeKey={statusFilter}
            onChange={handleStatusFilter}
            className="ant-tabs-nav-wrap"
          >
            <TabPane tab="Pending" key="PENDING">
              <div className="overflow-x-auto">
                <Table
                  columns={pendingColumns}
                  dataSource={dataSources.PENDING}
                  rowKey="id"
                  rowClassName="withdrawal-row text-xs sm:text-sm"
                  pagination={{
                    current: page.PENDING + 1,
                    pageSize: size,
                    total: pending.totalElements || 0,
                    onChange: (newPage) => {
                      setPage({ ...page, PENDING: newPage - 1 });
                    },
                    responsive: true,
                    showSizeChanger: false,
                  }}
                  scroll={{ x: 1000 }}
                />
              </div>
            </TabPane>
            <TabPane tab="Approved" key="APPROVED">
              <div className="overflow-x-auto">
                <Table
                  columns={approvedColumns}
                  dataSource={dataSources.APPROVED}
                  rowKey="id"
                  rowClassName="withdrawal-row text-xs sm:text-sm"
                  pagination={{
                    current: page.APPROVED + 1,
                    pageSize: size,
                    total: approved.totalElements || 0,
                    onChange: (newPage) => {
                      setPage({ ...page, APPROVED: newPage - 1 });
                    },
                    responsive: true,
                    showSizeChanger: false,
                  }}
                  scroll={{ x: 1400 }}
                />
              </div>
            </TabPane>
            <TabPane tab="Rejected" key="REJECTED">
              <div className="overflow-x-auto">
                <Table
                  columns={rejectedColumns}
                  dataSource={dataSources.REJECTED}
                  rowKey="id"
                  rowClassName="withdrawal-row text-xs sm:text-sm"
                  pagination={{
                    current: page.REJECTED + 1,
                    pageSize: size,
                    total: rejected.totalElements || 0,
                    onChange: (newPage) => {
                      setPage({ ...page, REJECTED: newPage - 1 });
                    },
                    responsive: true,
                    showSizeChanger: false,
                  }}
                  scroll={{ x: 1000 }}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
        <Modal
          title={modalAction ? `${modalAction.charAt(0).toUpperCase() + modalAction.slice(1)} Withdrawal Request` : ''}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={modalAction ? modalAction.charAt(0).toUpperCase() + modalAction.slice(1) : ''}
          cancelText="Cancel"
          okButtonProps={{
            className: modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700',
          }}
          className="sm:max-w-md max-w-full"
          getContainer={() => document.body}
        >
          <div ref={modalRef} className="flex flex-col gap-4">
            <Input.TextArea
              placeholder="Enter comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="mb-4"
            />
            {modalAction === 'approve' && (
              <>
                <Input
                  placeholder="Payment Reference (e.g., NEFT89654123)"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="mb-4"
                />
                <Select
                  placeholder="Transaction Type"
                  value={transactionType}
                  onChange={(value) => setTransactionType(value)}
                  className="mb-4"
                >
                  <Option value="BANK_TRANSFER">Bank Transfer</Option>
                  <Option value="UPI">UPI</Option>
                  <Option value="CASH">Cash</Option>
                </Select>
                <Input
                  placeholder="Transaction ID (e.g., TXN78965412)"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="mb-4"
                />
              </>
            )}
          </div>
        </Modal>
        <Modal
          title="Withdrawal Request Details"
          open={viewModalVisible}
          footer={[
            <Button key="back" onClick={handleViewModalCancel} className="bg-gray-600 hover:bg-gray-700 text-white">
              Back
            </Button>,
          ]}
          onCancel={handleViewModalCancel}
          className="sm:max-w-lg max-w-full"
          getContainer={() => document.body}
        >
          <div ref={modalRef} className="flex flex-col gap-4">
            {selectedRequest && (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Withdrawal ID">{selectedRequest.id}</Descriptions.Item>
                <Descriptions.Item label="Franchisee Name">{selectedRequest.franchiseeName}</Descriptions.Item>
                <Descriptions.Item label="Franchisee ID">{selectedRequest.franchiseeId}</Descriptions.Item>
                <Descriptions.Item label="District">{selectedRequest.districtName}</Descriptions.Item>
                <Descriptions.Item label="District ID">{selectedRequest.franchiseeDistrictId}</Descriptions.Item>
                <Descriptions.Item label="State">{selectedRequest.state}</Descriptions.Item>
                <Descriptions.Item label="Amount Requested">{selectedRequest.requestedAmount}</Descriptions.Item>
                <Descriptions.Item label="Reason">{selectedRequest.reason || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Status">{selectedRequest.status}</Descriptions.Item>
                <Descriptions.Item label="Payment Reference">
                  {selectedRequest.paymentReference || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Transaction Type">
                  {selectedRequest.transactionType || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Transaction ID">
                  {selectedRequest.transactionId || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Account Number">
                  {selectedRequest.accountNumber || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Bank Name">{selectedRequest.bankName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="IFSC Code">{selectedRequest.ifscCode || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Bank Detail ID">{selectedRequest.bankDetailId || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Available Balance">
                  {selectedRequest.availableBalance || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Original Balance">
                  {selectedRequest.originalBalance || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Updated Balance">
                  {selectedRequest.updatedBalance || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Processed By">
                  {selectedRequest.processedByName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Processed At">
                  {selectedRequest.processedAt
                    ? moment(selectedRequest.processedAt).format('YYYY-MM-DD HH:mm:ss')
                    : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Admin Comments">
                  {selectedRequest.adminComments || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Screenshot URL">
                  {selectedRequest.screenshotUrl ? (
                    <Link href={selectedRequest.screenshotUrl} target="_blank">
                      View Screenshot
                    </Link>
                  ) : (
                    'N/A'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {moment(selectedRequest.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                  {selectedRequest.updatedAt
                    ? moment(selectedRequest.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                    : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        </Modal>
        <ToastContainer position="top-right" autoClose={3000} />
      </Spin>
    </div>
  );
};

export default FranchiseeWithdrawal;