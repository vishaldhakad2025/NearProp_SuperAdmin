import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Image, Typography, Divider, Row, Col, Tag, Button, Space } from 'antd';
import { fetchAdById, fetchAdvertisements } from '../../redux/slices/advertisementSlice';
import AdvertisementDashboardCards from './AdvertisementDashboardCards';
import { ArrowLeftOutlined } from '@ant-design/icons';
const { Title, Paragraph, Link } = Typography;

const AdvertisementViewPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: ad, loading } = useSelector((state) => state.advertisements);

  useEffect(() => {
    if (id) {
      dispatch(fetchAdById(id));
    }
    dispatch(fetchAdvertisements());
  }, [dispatch, id]);

  if (!ad) return <div className="p-8 text-center text-gray-500">Loading Advertisement...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Title level={2}>Advertisement Details</Title>

      <div className="flex justify-end mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>
      {/* 🔹 Static Cards Section */}
      <AdvertisementDashboardCards ad={ad} loading={loading} />

      <Card className="shadow rounded-lg mt-6">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Image
              src={ad.bannerImageUrl}
              alt={ad.title}
              className="rounded-lg"
              width="100%"
            />
          </Col>
          <Col xs={24} md={12}>
            <Descriptions bordered column={1} labelStyle={{ fontWeight: 600 }}>
              <Descriptions.Item label="Title">{ad.title}</Descriptions.Item>
              <Descriptions.Item label="Description">
                <Paragraph>{ad.description}</Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Target Location">{ad.targetLocation}</Descriptions.Item>
              <Descriptions.Item label="District">{ad.districtName}</Descriptions.Item>
              <Descriptions.Item label="Radius (km)">{ad.radiusKm}</Descriptions.Item>
              <Descriptions.Item label="Valid From">{new Date(ad.validFrom).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Valid Until">{new Date(ad.validUntil).toLocaleString()}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider className="my-6" />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={4}>Contact Details</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="WhatsApp">{ad.whatsappNumber}</Descriptions.Item>
              <Descriptions.Item label="Phone">{ad.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Email">{ad.emailAddress}</Descriptions.Item>
            </Descriptions>
          </Col>

          <Col xs={24} md={12}>
            <Title level={4}>Links</Title>
            <Space direction="vertical">
              {ad.websiteUrl && <Link href={ad.websiteUrl} target="_blank">Website</Link>}
              {ad.instagramUrl && <Link href={ad.instagramUrl} target="_blank">Instagram</Link>}
              {ad.facebookUrl && <Link href={ad.facebookUrl} target="_blank">Facebook</Link>}
              {ad.youtubeUrl && <Link href={ad.youtubeUrl} target="_blank">YouTube</Link>}
              {ad.twitterUrl && <Link href={ad.twitterUrl} target="_blank">Twitter</Link>}
              {ad.linkedinUrl && <Link href={ad.linkedinUrl} target="_blank">LinkedIn</Link>}
            </Space>
          </Col>
        </Row>

        <Divider className="my-6" />

        <Title level={5}>Created By</Title>
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Name">{ad.createdBy?.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{ad.createdBy?.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{ad.createdBy?.mobileNumber}</Descriptions.Item>
          <Descriptions.Item label="Roles">{ad.createdBy?.roles?.join(', ')}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default AdvertisementViewPage;