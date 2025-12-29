import React from 'react';
import { Card, Statistic } from 'antd';
import { EyeOutlined, LikeOutlined, PhoneOutlined, WhatsAppOutlined, GlobalOutlined, ShareAltOutlined } from '@ant-design/icons';

const AdvertisementDashboardCards = ({ ad, loading }) => {
  const totalViews = ad.viewCount || "null";
  const totalClicks = ad.clickCount || "null";
  const totalWhatsapp = ad.whatsappClicks || "null";
  const totalPhone = ad.phoneClicks || "null";
  const totalWebsite = ad.websiteClicks || "null";
  const totalSocial = ad.socialMediaClicks || "null";

  const cards = [
    {
      title: 'Total Views',
      icon: <EyeOutlined className="text-green-600 text-3xl" />,
      value: totalViews,
    },
    {
      title: 'Total Clicks',
      icon: <LikeOutlined className="text-indigo-600 text-3xl" />,
      value: totalClicks,
    },
    {
      title: 'WhatsApp Clicks',
      icon: <WhatsAppOutlined className="text-green-500 text-3xl" />,
      value: totalWhatsapp,
    },
    {
      title: 'Phone Clicks',
      icon: <PhoneOutlined className="text-red-500 text-3xl" />,
      value: totalPhone,
    },
    {
      title: 'Website Clicks',
      icon: <GlobalOutlined className="text-yellow-500 text-3xl" />,
      value: totalWebsite,
    },
    {
      title: 'Social Clicks',
      icon: <ShareAltOutlined className="text-pink-600 text-3xl" />,
      value: totalSocial,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-2 mb-5">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="shadow hover:shadow-md transition-shadow rounded-lg"
        >
          <div className="flex items-center gap-4">
            {card.icon}
            <Statistic title={card.title} value={card.value} loading={loading} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdvertisementDashboardCards;