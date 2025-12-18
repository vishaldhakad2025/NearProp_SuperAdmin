import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Input, Select, Spin, Modal, DatePicker, Card, Statistic, Typography, Space, Tag, Descriptions } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { gsap } from 'gsap';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchFranchiseeRequests,
  fetchFranchiseeStatistics,
  fetchFranchiseeByDistrict,
  fetchFranchiseeReport,
  approveFranchiseeRequest,
  rejectFranchiseeRequest,
  terminateFranchiseeRequest,
} from '../../redux/slices/franchiseeSlice';
import 'antd/dist/reset.css';

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const FranchiseeDashboard = () => {
  const dispatch = useDispatch();
  const { requests, statistics, loading, totalPages, totalElements, error } = useSelector((state) => state.franchisee);
  
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [districtFilter, setDistrictFilter] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [comment, setComment] = useState('');
  const [endDate, setEndDate] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const modalRef = useRef(null);
  const detailModalRef = useRef(null);

  const defaultComments = {
    approve: 'Approved after verification by Admin',
    reject: 'Missing required documents',
    terminate: 'Terminated due to non-compliance',
  };

  useEffect(() => {
    dispatch(fetchFranchiseeRequests({
      page,
      size,
      searchTerm,
      status: statusFilter,
      districtId: districtFilter,
      startDate: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null,
      endDate: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null,
    }));
    dispatch(fetchFranchiseeStatistics());
    dispatch(fetchFranchiseeByDistrict(null)).then((result) => {
      if (result.payload) {
        const uniqueDistricts = [...new Set(result.payload.map((req) => ({ id: req.districtId, name: req.districtName })))];
        setDistricts(uniqueDistricts);
      }
    });
  }, [dispatch, page, size, searchTerm, statusFilter, districtFilter, dateRange]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`, { position: 'top-right', autoClose: 3000 });
    }
  }, [error]);

  useEffect(() => {
    gsap.utils.toArray('.franchisee-row').forEach((row, i) => {
      gsap.fromTo(
        row,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: i * 0.1 }
      );
    });
    gsap.utils.toArray('.statistic-card').forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', delay: i * 0.1 }
      );
    });
    if (modalVisible && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' }
      );
    }
    if (detailModalVisible && detailModalRef.current) {
      gsap.fromTo(
        detailModalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' }
      );
    }
  }, [requests, modalVisible, detailModalVisible, statistics]);

  const handleAction = (action, record) => {
    setModalAction(action);
    setSelectedRequestId(record.id);
    setComment(defaultComments[action]);
    setEndDate(action === 'approve' ? moment().add(1, 'year') : null);
    setModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const handleModalOk = async () => {
    if (!comment.trim()) {
      toast.error('Comment is required', { position: 'top-right', autoClose: 3000 });
      return;
    }

    try {
      if (modalAction === 'approve') {
        await dispatch(
          approveFranchiseeRequest({
            id: selectedRequestId,
            comments: comment,
            endDate: endDate ? moment(endDate).format('YYYY-MM-DD') : null,
          })
        ).unwrap();
        toast.success('Franchisee request approved successfully', { position: 'top-right', autoClose: 3000 });
      } else if (modalAction === 'reject') {
        await dispatch(rejectFranchiseeRequest({ id: selectedRequestId, comments: comment })).unwrap();
        toast.success('Franchisee request rejected successfully', { position: 'top-right', autoClose: 3000 });
      } else if (modalAction === 'terminate') {
        await dispatch(terminateFranchiseeRequest({ id: selectedRequestId, comments: comment })).unwrap();
        toast.success('Franchisee request terminated successfully', { position: 'top-right', autoClose: 3000 });
      }
      setModalVisible(false);
      dispatch(fetchFranchiseeRequests({
        page,
        size,
        searchTerm,
        status: statusFilter,
        districtId: districtFilter,
        startDate: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null,
        endDate: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null,
      }));
      dispatch(fetchFranchiseeStatistics());
    } catch (err) {
      toast.error(`Failed to ${modalAction} request: ${err.message}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setComment('');
    setEndDate(null);
    setSelectedRequestId(null);
    setModalAction(null);
  };

  const handleDetailModalCancel = () => {
    setDetailModalVisible(false);
    setSelectedRequest(null);
  };

  const handleDownloadReport = async () => {
    try {
      const report = await dispatch(fetchFranchiseeReport()).unwrap();
      const csvContent = [
        [
          'ID',
          'Franchisee Name',
          'Business Name',
          'District',
          'State',
          'Status',
          'Payment Status',
          'Payment Due Date',
          'Total Revenue',
          'Franchisee Commission',
          'Admin Share',
          'Current Balance',
          'Final Payable Amount',
          'New Subscriptions',
          'Renewed Subscriptions',
          'Total Subscriptions',
          'Account Name',
          'Account Number',
          'IFSC Code',
          'Bank Name',
          'Created At',
          'Updated At',
          'Generated At',
          'Emergency Withdrawals Amount',
          'Emergency Withdrawals Count',
        ],
        ...report.map((req) => [
          req.id,
          req.franchiseeName || req.user?.name || '',
          req.businessName || '',
          req.districtName || '',
          req.state || '',
          req.status || '',
          req.paymentStatus || '',
          req.paymentDueDate ? moment(req.paymentDueDate).format('YYYY-MM-DD') : '',
          req.totalRevenue?.toFixed(2) || '0.00',
          req.franchiseeCommission?.toFixed(2) || '0.00',
          req.adminShare?.toFixed(2) || '0.00',
          req.currentBalance?.toFixed(2) || '0.00',
          req.finalPayableAmount?.toFixed(2) || '0.00',
          req.newSubscriptions || '0',
          req.renewedSubscriptions || '0',
          req.totalSubscriptions || '0',
          req.accountName || '',
          req.accountNumber || '',
          req.ifscCode || '',
          req.bankName || '',
          moment(req.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          moment(req.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
          moment(req.generatedAt).format('YYYY-MM-DD HH:mm:ss'),
          req.emergencyWithdrawalsAmount?.toFixed(2) || '0.00',
          req.emergencyWithdrawalsCount || '0',
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'franchisee_monthly_report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Monthly report downloaded successfully', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      toast.error(`Failed to download report: ${err.message}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleDistrictFilter = (value) => {
    setDistrictFilter(value);
    setPage(0);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates || [null, null]);
    setPage(0);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, fixed: 'left' },
    {
      title: 'Franchisee Name',
      dataIndex: 'franchiseeName',
      key: 'franchiseeName',
      render: (name) => <Text strong>{name || 'N/A'}</Text>,
    },
    { title: 'Business Name', dataIndex: 'businessName', key: 'businessName', render: (name) => name || 'N/A' },
    { title: 'District', dataIndex: 'districtName', key: 'districtName', render: (name) => name || 'N/A' },
    { title: 'State', dataIndex: 'state', key: 'state', render: (state) => state || 'N/A' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={
            status === 'APPROVED' ? 'green' :
            status === 'REJECTED' ? 'red' :
            status === 'TERMINATED' ? 'gray' : 'yellow'
          }
        >
          {status || 'PENDING'}
        </Tag>
      ),
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'PAID' ? 'blue' : 'default'}>
          {status || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Total Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue) => `₹${revenue?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Franchisee Commission',
      dataIndex: 'franchiseeCommission',
      key: 'franchiseeCommission',
      render: (commission) => `₹${commission?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Admin Share',
      dataIndex: 'adminShare',
      key: 'adminShare',
      render: (share) => `₹${share?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Current Balance',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      render: (balance) => `₹${balance?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Final Payable',
      dataIndex: 'finalPayableAmount',
      key: 'finalPayableAmount',
      render: (amount) => `₹${amount?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actions',
      key: 'actions',
     
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            className="text-cyan-200 hover:text-cyan-300"
          >
            View
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction('approve', record)}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleAction('reject', record)}
                danger
              >
                Reject
              </Button>
            </>
          )}
          {record.status === 'APPROVED' && (
            <Button
              type="primary"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleAction('terminate', record)}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Terminate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <Spin spinning={loading} tip="Loading franchisee data...">
        <header className="bg-gradient-to-r from-cyan-600 to-cyan-400 text-white p-4 sm:p-6 rounded-xl shadow-xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Title level={3} className="m-0">Franchisee Management Dashboard</Title>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadReport}
            className="bg-cyan-300 hover:bg-cyan-100 text-white font-semibold shadow-md hover:shadow-lg transition-shadow duration-300"
            size="large"
          >
            Download Report
          </Button>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="statistic-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
            <Statistic title="Pending Requests" value={statistics.PENDING || 0} valueStyle={{ color: '#faad14' }} />
          </Card>
          <Card className="statistic-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
            <Statistic title="Approved Requests" value={statistics.APPROVED || 0} valueStyle={{ color: '#52c41a' }} />
          </Card>
          <Card className="statistic-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
            <Statistic title="Rejected Requests" value={statistics.REJECTED || 0} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
          <Card className="statistic-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
            <Statistic title="Terminated Requests" value={statistics.TERMINATED || 0} valueStyle={{ color: '#8c8c8c' }} />
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Input
              placeholder="Search by name, ID, or business name"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-lg w-full sm:w-1/2 lg:w-2/5 shadow-sm hover:shadow-md transition-shadow duration-300 border-gray-300 focus:border-cyan-500"
              size="large"
            />
            <Select
              placeholder="Filter by status"
              allowClear
              onChange={handleStatusFilter}
              className="w-full sm:w-48 lg:w-1/5 shadow-sm hover:shadow-md transition-shadow duration-300"
              size="large"
            >
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="TERMINATED">Terminated</Option>
            </Select>
            <Select
              placeholder="Filter by district"
              allowClear
              onChange={handleDistrictFilter}
              className="w-full sm:w-48 lg:w-1/5 shadow-sm hover:shadow-md transition-shadow duration-300"
              size="large"
            >
              {districts.map((district) => (
                <Option key={district.id} value={district.id}>
                  {district.name}
                </Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-full sm:w-48 lg:w-1/5 shadow-sm hover:shadow-md transition-shadow duration-300"
              size="large"
              placeholder={['Start Date', 'End Date']}
            />
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            rowClassName="franchisee-row hover:bg-gray-50 transition-colors"
            pagination={{
              current: page + 1,
              pageSize: size,
              total: totalElements,
              onChange: (newPage, newPageSize) => {
                setPage(newPage - 1);
                setSize(newPageSize);
              },
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
            scroll={{ x: 1500 }}
          />
        </Card>

        {/* Action Modal */}
        <Modal
          title={modalAction ? `${modalAction.charAt(0).toUpperCase() + modalAction.slice(1)} Franchisee Request` : ''}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={modalAction ? modalAction.charAt(0).toUpperCase() + modalAction.slice(1) : ''}
          cancelText="Cancel"
          okButtonProps={{
            className: modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                      modalAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-gray-500 hover:bg-gray-600'
          }}
          getContainer={() => document.body}
        >
          <div ref={modalRef} className="flex flex-col gap-4">
            <Input.TextArea
              placeholder="Enter comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mb-4 rounded-lg border-gray-300 focus:border-cyan-500"
            />
            {modalAction === 'approve' && (
              <DatePicker
                placeholder="Select end date (optional)"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                className="w-full rounded-lg border-gray-300 focus:border-cyan-500"
                format="YYYY-MM-DD"
              />
            )}
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal
          title="Franchisee Request Details"
          open={detailModalVisible}
          onCancel={handleDetailModalCancel}
          footer={[
            <Button key="close" onClick={handleDetailModalCancel}>
              Close
            </Button>,
          ]}
          width={800}
          getContainer={() => document.body}
        >
          <div ref={detailModalRef}>
            {selectedRequest && (
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="ID">{selectedRequest.id}</Descriptions.Item>
                <Descriptions.Item label="Franchisee Name">{selectedRequest.franchiseeName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Business Name">{selectedRequest.businessName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="District">{selectedRequest.districtName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="State">{selectedRequest.state || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={
                      selectedRequest.status === 'APPROVED' ? 'green' :
                      selectedRequest.status === 'REJECTED' ? 'red' :
                      selectedRequest.status === 'TERMINATED' ? 'gray' : 'yellow'
                    }
                  >
                    {selectedRequest.status || 'PENDING'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Tag color={selectedRequest.paymentStatus === 'PAID' ? 'blue' : 'default'}>
                    {selectedRequest.paymentStatus || 'N/A'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Due Date">
                  {selectedRequest.paymentDueDate ? moment(selectedRequest.paymentDueDate).format('YYYY-MM-DD') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Total Revenue">₹{selectedRequest.totalRevenue?.toFixed(2) || '0.00'}</Descriptions.Item>
                <Descriptions.Item label="Franchisee Commission">₹{selectedRequest.franchiseeCommission?.toFixed(2) || '0.00'}</Descriptions.Item>
                <Descriptions.Item label="Admin Share">₹{selectedRequest.adminShare?.toFixed(2) || '0.00'}</Descriptions.Item>
                <Descriptions.Item label="Current Balance">₹{selectedRequest.currentBalance?.toFixed(2) || '0.00'}</Descriptions.Item>
                <Descriptions.Item label="Final Payable Amount">₹{selectedRequest.finalPayableAmount?.toFixed(2) || '0.00'}</Descriptions.Item>
                <Descriptions.Item label="New Subscriptions">{selectedRequest.newSubscriptions || '0'}</Descriptions.Item>
                <Descriptions.Item label="Renewed Subscriptions">{selectedRequest.renewedSubscriptions || '0'}</Descriptions.Item>
                <Descriptions.Item label="Total Subscriptions">{selectedRequest.totalSubscriptions || '0'}</Descriptions.Item>
                <Descriptions.Item label="Account Name">{selectedRequest.accountName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Account Number">{selectedRequest.accountNumber || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="IFSC Code">{selectedRequest.ifscCode || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Bank Name">{selectedRequest.bankName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Created At">{moment(selectedRequest.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="Updated At">{moment(selectedRequest.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="Generated At">{moment(selectedRequest.generatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="Emergency Withdrawals Amount">₹{selectedRequest.emergencyWithdrawalsAmount?.toFixed(2) || '0.00'}</Descriptions.Item>
                <Descriptions.Item label="Emergency Withdrawals Count">{selectedRequest.emergencyWithdrawalsCount || '0'}</Descriptions.Item>
              </Descriptions>
            )}
          </div>
        </Modal>
        <ToastContainer position="top-right" autoClose={3000} />
      </Spin>
    </div>
  );
};

export default FranchiseeDashboard;