import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createAdvertisement,
  deleteAdvertisement,
  updateAdvertisement,
  clearSelectedAd,
  fetchAdvertisements,
} from '../../redux/slices/advertisementSlice';
import { fetchDistricts } from '../../redux/slices/districtSlice';
import { useNavigate } from 'react-router-dom';
import AdvertisementForm from './AdvertisementForm';

import {
  PlusOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Pagination, Input, Select, Spin, Button, Tag, Image, Table, Space } from 'antd';

const { Option } = Select;

const AdminAdvertisementPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector((state) => state.advertisements);
  const { list: districts } = useSelector((state) => state.districts);

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAdvertisements());
    dispatch(fetchDistricts());
  }, [dispatch]);

  const handleCreate = async (formData) => {
    try {
      await dispatch(createAdvertisement(formData)).unwrap();
      setIsOpenForm(false);
    } catch (err) {
      console.error('Advertisement creation failed:', err);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await dispatch(updateAdvertisement({ id: editingAd.id, formData })).unwrap();
      setEditingAd(null);
      setIsOpenForm(false);
      dispatch(clearSelectedAd());
    } catch (err) {
      console.error('Update failed:', err);
    }
  };


  const handleEditClick = (ad) => {
    setEditingAd(ad);
    setIsOpenForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this advertisement?')) {
      dispatch(deleteAdvertisement(id));
    }
  };

  const filteredList = list
    .filter((ad) => ad.title.toLowerCase().includes(search.toLowerCase()))
    .filter((ad) => (statusFilter === 'all' ? true : ad.status === statusFilter))
    .filter((ad) => (districtFilter ? ad.districtName === districtFilter : true));

  const columns = [
    {
      title: 'Banner',
      dataIndex: 'bannerImageUrl',
      key: 'bannerImageUrl',
      render: (url) => url ? <Image src={url} alt="banner" width={60} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} /> : <span className="text-gray-400">No image</span>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => desc?.slice(0, 50) + '...',
    },
    {
      title: 'District',
      dataIndex: 'districtName',
      key: 'districtName',
    },
    {
      title: 'Valid Until',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? 'PUBLISHED' : 'UNPUBLISHED'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditClick(record)} type="link" />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} type="link" danger />
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/dashboard/advertisements/${record.id}`)} type="link" />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Advertisement Management</h2>

      <div className="flex justify-end mb-4">
        <Button
          type={isOpenForm ? 'default' : 'primary'}
          danger={isOpenForm}
          icon={isOpenForm ? <CloseOutlined /> : <PlusOutlined />}
          onClick={() => {
            setIsOpenForm(!isOpenForm);
            setEditingAd(null);
          }}
        >
          {isOpenForm ? 'Close Edit' : 'Add Advertisement'}
        </Button>
      </div>

      {isOpenForm ? (
        <div className="bg-white shadow p-4 rounded">
          <AdvertisementForm
            initialValues={editingAd || {}}
            districts={districts}
            onSubmit={editingAd ? handleUpdate : handleCreate}
            onCancel={() => {
              setIsOpenForm(false);
              setEditingAd(null);
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 px-4 py-2 rounded">
            <Input.Search
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 250 }}
            />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
              <Option value="all">All Status</Option>
              <Option value="PUBLISHED">Published</Option>
              <Option value="UNPUBLISHED">Unpublished</Option>
            </Select>
            <Select
              showSearch
              value={districtFilter}
              onChange={setDistrictFilter}
              placeholder="Filter by District"
              style={{ width: 200 }}
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value="">All Districts</Option>
              {districts
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((d) => (
                  <Option key={d.id} value={d.name}>
                    {d.name}
                  </Option>
                ))}
            </Select>
          </div>

          <div className="bg-white shadow rounded">
            {loading ? (
              <div className="p-10 flex justify-center">
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Table
                  columns={columns}
                  dataSource={filteredList}
                  pagination={{
                    current: currentPage,
                    pageSize,
                    total: filteredList.length,
                    onChange: (page) => setCurrentPage(page),
                  }}
                  rowKey="id"
                  scroll={{ x: 'max-content' }} 
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAdvertisementPage;