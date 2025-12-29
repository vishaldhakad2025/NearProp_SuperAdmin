import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin, Button, Space, Modal, Descriptions } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const Enquiry = ({ text = "Back" }) => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://api.nearprop.com/api/inquiries', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch enquiries');
            }
            const data = await response.json();
            setEnquiries(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
            console.error('Failed to fetch enquiries');
            setEnquiries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const handleView = (record) => {
        setSelectedEnquiry(record);
    };

    const handleModalClose = () => {
        setSelectedEnquiry(null);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Mobile',
            dataIndex: 'mobileNumber',
            key: 'mobileNumber',
        },
        {
            title: 'Info Type',
            dataIndex: 'infoType',
            key: 'infoType',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'IN_REVIEW') color = 'orange';
                if (status === 'APPROVED') color = 'green';
                if (status === 'REJECTED' || status === 'COMPLETED') color = 'red';
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Property Type',
            dataIndex: 'propertyType',
            key: 'propertyType',
        },
        {
            title: 'Max Price',
            dataIndex: 'maxPrice',
            key: 'maxPrice',
            render: (price) => `₹${price?.toLocaleString() || 'N/A'}`,
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
                        View
                    </Button>
                </Space>
            ),
        },
    ];
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); // go back one step
    };


    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Enquiries Management</h2>
            <button
                onClick={handleBack}
                className="bg-gray-300 text-blue-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
            >
                {text}
            </button>
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    dataSource={enquiries}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            )}

            <Modal
                title="Enquiry Details"
                open={!!selectedEnquiry}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                {selectedEnquiry && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Name">{selectedEnquiry.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedEnquiry.email}</Descriptions.Item>
                        <Descriptions.Item label="Mobile Number">{selectedEnquiry.mobileNumber}</Descriptions.Item>
                        <Descriptions.Item label="Info Type">{selectedEnquiry.infoType}</Descriptions.Item>
                        <Descriptions.Item label="Status">{selectedEnquiry.status}</Descriptions.Item>
                        <Descriptions.Item label="Property Type">{selectedEnquiry.propertyType}</Descriptions.Item>
                        <Descriptions.Item label="Max Price">₹{selectedEnquiry.maxPrice?.toLocaleString() || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Bedrooms">{selectedEnquiry.bedrooms || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Bathrooms">{selectedEnquiry.bathrooms || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Min Size">{selectedEnquiry.minSize || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="State">{selectedEnquiry.state}</Descriptions.Item>
                        <Descriptions.Item label="City">{selectedEnquiry.city}</Descriptions.Item>
                        <Descriptions.Item label="Area">{selectedEnquiry.area || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Zip Code">{selectedEnquiry.zipCode}</Descriptions.Item>
                        <Descriptions.Item label="District ID">{selectedEnquiry.districtId}</Descriptions.Item>
                        <Descriptions.Item label="Latitude">{selectedEnquiry.latitude}</Descriptions.Item>
                        <Descriptions.Item label="Longitude">{selectedEnquiry.longitude}</Descriptions.Item>
                        <Descriptions.Item label="Message">{selectedEnquiry.message}</Descriptions.Item>
                        <Descriptions.Item label="Created At">{new Date(selectedEnquiry.createdAt).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Last Updated At">{new Date(selectedEnquiry.lastUpdatedAt).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Status History">
                            {selectedEnquiry.statusHistory && selectedEnquiry.statusHistory.length > 0 ? (
                                <ul>
                                    {selectedEnquiry.statusHistory.map((hist, idx) => (
                                        <li key={idx}>
                                            <strong>{hist.status}</strong> - {hist.comment || ''}{' '}
                                            {hist.updatedBy ? `Updated by: ${hist.updatedBy}` : ''}{' '}
                                            <em>{new Date(hist.updatedAt).toLocaleString()}</em>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                'No history available'
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default Enquiry;