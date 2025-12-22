import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchReelsByProperty, getPropertyById } from "../../redux/slices/propertySlice";
import {
  Image,
  Spin,
  Tag,
  Descriptions,
  Divider,
  Card,
  Carousel,
  Button,
  Typography,
  Space,
  Tooltip,
  Empty,
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  InfoCircleOutlined,
  VideoCameraOutlined,
  StarOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  PhoneOutlined,
  ShareAltOutlined,
  FacebookFilled,
  // InstagramOutlined,
  WhatsAppOutlined,
  TwitterOutlined,
  DollarCircleOutlined,
  AppstoreOutlined,
  TeamOutlined,
  CarOutlined,
  BorderOutlined,
  MailOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { gsap } from "gsap";
import { HouseIcon, Recycle, ShowerHead } from "lucide-react";

const { Title, Paragraph, Text } = Typography;

const PropertyDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProperty, loading, reels } = useSelector((state) => state.property);
  const contentRef = useRef(null);
  const [selectedReel, setSelectedReel] = useState(null);
  useEffect(() => {
    if (id) dispatch(getPropertyById(id));
    dispatch(fetchReelsByProperty({ propertyId: id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProperty && contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [selectedProperty]);

  if (loading || !selectedProperty) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  const prop = selectedProperty;
  const shareUrl = `${window.location.origin}/property/${prop.id}`;
  const shareText = `Check out this amazing property: ${prop.title} - ${shareUrl}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Back Button */}
        <div
          className="p-4 sm:p-6 flex items-center gap-2 text-cyan-600 cursor-pointer hover:text-cyan-800 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftOutlined className="text-xl" />
          <Text strong>Back to Properties</Text>
        </div>

        <div ref={contentRef}>
          {/* Title & Overview */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-cyan-100 to-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Title level={2} className="mb-2 text-gray-800">
                  {prop.title}
                </Title>
                <Paragraph className="text-gray-600 font-semibold flex items-center gap-2">
                  <EnvironmentOutlined className="text-cyan-600" />
                  {prop.address}, {prop.city}, {prop.state} - {prop.pincode}
                </Paragraph>
              </div>

              {/* Social Share */}
              <Space>
                <Tooltip title="Share on Facebook">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FacebookFilled className="text-blue-600 text-2xl hover:scale-110 transition" />
                  </a>
                </Tooltip>
                <Tooltip title="Share on WhatsApp">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsAppOutlined className="text-green-500 text-2xl hover:scale-110 transition" />
                  </a>
                </Tooltip>
                <Tooltip title="Share on Twitter">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      shareText
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <TwitterOutlined className="text-sky-500 text-2xl hover:scale-110 transition" />
                  </a>
                </Tooltip>
                {/* <Tooltip title="Share on Instagram">
                  <InstagramOutlined className="text-pink-500 text-2xl" />
                </Tooltip> */}
              </Space>
            </div>

            <Space wrap className="mt-3">
              <Tag color="blue" icon={<HomeOutlined />}>
                {prop.type}
              </Tag>
              <Tag color="green" icon={<StarOutlined />}>
                {prop.status}
              </Tag>
              <Tag color={prop.featured ? "blue" : "default"}>
                {prop.featured ? "Featured" : "Standard"}
              </Tag>
              <Tag color={prop.active ? "green" : "red"}>
                {prop.active ? "Active" : "Inactive"}
              </Tag>
              <Tag color={prop.approved ? "green" : "red"}>
                {prop.approved ? "Approved" : "Pending"}
              </Tag>
            </Space>
          </div>

          {/* Image Carousel */}
          {prop.imageUrls?.length > 0 && (
            <div className="p-4 sm:p-8">
              <Carousel autoplay effect="fade" className="rounded-xl shadow-lg">
                {prop.imageUrls.map((url, idx) => (
                  <div key={idx}>
                    <Image
                      src={url}
                      alt={`Property ${idx + 1}`}

                      className="!w-full !max-h-[60vh] object-fill  rounded-xl"
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          <div className="max-w-6xl mx-auto py-6 !space-y-6">
            {/* Overview */}
            <Card className="shadow-md rounded-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="flex flex-col items-center shadow-md bg-[whitesomke] rounded-e-lg">
                  <HouseIcon className="text-cyan-600 text-xl mb-1" />
                  <Text className="font-bold text-lg">{prop.bedrooms}</Text>
                  <Paragraph className="text-gray-500">Bedrooms</Paragraph>
                </div>
                <div className="flex flex-col items-center shadow-md bg-[whitesomke] rounded-e-lg">
                  <ShowerHead className="text-cyan-600 text-xl mb-1" />
                  <Text className="font-bold text-lg">{prop.bathrooms}</Text>
                  <Paragraph className="text-gray-500">Bathrooms</Paragraph>
                </div>
                {/* <div className="flex flex-col items-center shadow-md bg-[whitesomke] rounded-e-lg">
                  <CarOutlined className="text-cyan-600 text-xl mb-1" />
                  <Text className="font-bold text-lg">{prop.garages}</Text>
                  <Paragraph className="text-gray-500">Garage</Paragraph>
                </div> */}
                <div className="flex flex-col items-center shadow-md bg-[whitesomke] rounded-e-lg">
                  <BorderOutlined className="text-cyan-600 text-xl mb-1" />
                  <Text className="font-bold text-lg">
                    {prop.area} {prop.sizePostfix}
                  </Text>
                  <Paragraph className="text-gray-500">Area Size</Paragraph>
                </div>
              </div>
              <Divider className="my-4 border-gray-200" />
              <div className="flex flex-wrap gap-3">
                <Tag color="blue" icon={<HomeOutlined />}>
                  Property ID: {prop.permanentId}
                </Tag>
                <Tag color="green" icon={<DollarCircleOutlined />}>
                  Year Built: {prop.yearBuilt}
                </Tag>
                <Tag color="cyan" className="flex gap-2" >
                  Renovated: {prop.renovated ? "Yes" : "No"}
                </Tag>
              </div>
            </Card>
            <Card
              className="shadow-md rounded-xl !my-2"
              title={<Title level={4}>Public Note</Title>}
            >
              <Paragraph className="text-gray-700">
                {prop.note || "No description available."}
              </Paragraph>
            </Card>
            {/* Description */}
            <Card
              className="shadow-md rounded-xl !my-1"
              title={<Title level={4}>Description</Title>}
            >
              <Paragraph className="text-gray-700">
                {prop.description || "No description available."}
              </Paragraph>
            </Card>

            {/* Address */}
            <Card
              className="shadow-md rounded-xl"
              title={<Title level={4}>Address</Title>}
            >
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Address">
                  {prop.address}
                </Descriptions.Item>
                <Descriptions.Item label="Place Name">
                  {prop.placeName}
                </Descriptions.Item>
                <Descriptions.Item label="City">{prop.city}</Descriptions.Item>
                <Descriptions.Item label="State">{prop.state}</Descriptions.Item>
                <Descriptions.Item label="Zip Code">{prop.pincode}</Descriptions.Item>
                <Descriptions.Item label="Country">{prop.country}</Descriptions.Item>
              </Descriptions>
              {prop.latitude && prop.longitude && (
                <a
                  href={`https://maps.google.com?q=${prop.latitude},${prop.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    type="primary"
                    className="mt-4 bg-cyan-600"
                    icon={<EnvironmentOutlined />}
                  >
                    Open in Google Maps
                  </Button>
                </a>
              )}
            </Card>

            {/* Details */}
            <Card
              className="shadow-md rounded-xl"
              title={<Title level={4}>Details</Title>}
            >
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Property ID">
                  {prop.propertyId}
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  ₹{prop.price?.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Property Size">
                  {prop.area} {prop.sizePostfix}
                </Descriptions.Item>
                <Descriptions.Item label="Bedrooms">{prop.bedrooms}</Descriptions.Item>
                <Descriptions.Item label="Bathrooms">
                  {prop.bathrooms}
                </Descriptions.Item>
                <Descriptions.Item label="Garage">{prop.garages}</Descriptions.Item>
                <Descriptions.Item label="Garage Size">{prop.garageSize}</Descriptions.Item>
                <Descriptions.Item label="Year Built">{prop.yearBuilt}</Descriptions.Item>
                <Descriptions.Item label="Property Type">
                  {prop.type}
                </Descriptions.Item>
                <Descriptions.Item label="Property Status">
                  {prop.status}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Features */}
            <Card
              className="shadow-md rounded-xl"
              title={<Title level={4}>Features</Title>}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {prop.features?.map((feature, idx) => (
                  <Tag
                    key={idx}
                    color="cyan"
                    icon={<AppstoreOutlined />}
                    className="px-3 py-1 text-sm"
                  >
                    {feature}
                  </Tag>
                ))}
              </div>
            </Card>


            {/* Floor Plans */}
            {prop.floorPlans?.length > 0 && (
              <Card
                className="shadow-md rounded-xl"
                title={<Title level={4}>Floor Plans</Title>}
              >
                {prop.floorPlans.map((plan, idx) => (
                  <div key={idx} className="mb-3">
                    <Text strong>{plan.name}</Text>
                    <Paragraph>
                      Size: {plan.size} Sq Ft | Price: ₹{plan.price}
                    </Paragraph>
                  </div>
                ))}
              </Card>
            )}

            {/* Additional Details */}
            <Card
              className="shadow-md rounded-xl"
              title={<Title level={4}>Additional Details</Title>}
            >
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Deposit">{prop.deposit}</Descriptions.Item>
                <Descriptions.Item label="Pool Size">{prop.poolSize}</Descriptions.Item>
                <Descriptions.Item label="Last Renovated">
                  {prop.lastRenovated}
                </Descriptions.Item>
                <Descriptions.Item label="Amenities">
                  {prop.amenities}
                </Descriptions.Item>
                <Descriptions.Item label="Additional Rooms">
                  {prop.additionalRooms}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Reels Section */}
            <Card title={`Reels (${reels?.length || 0})`} className="shadow rounded-xl">
              {!reels || reels.length === 0 ? (
                <Empty description="No reels available for this property." />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {reels.map((reel) => (
                    <div
                      key={reel.id}
                      className="relative rounded-lg overflow-hidden shadow hover:scale-105 transition cursor-pointer"
                      onClick={() => setSelectedReel(reel)}
                    >
                      <video
                        src={reel?.videoUrl}
                        className="w-full h-48 object-cover"
                        muted
                        loop
                        playsInline
                      />
                      <div className="absolute bottom-0 w-full bg-black/50 text-white p-2 text-sm flex justify-between">
                        <span>{reel.title}</span>
                        <span>{reel.viewCount} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Reel Modal */}
            {selectedReel && (
              <div
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                onClick={() => setSelectedReel(null)}
              >
                <div
                  className="bg-white rounded-xl overflow-hidden max-w-2xl w-full relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-2 right-2 text-white bg-black rounded-full px-2"
                    onClick={() => setSelectedReel(null)}
                  >
                    ×
                  </button>
                  <video
                    controls
                    autoPlay
                    className="w-full max-h-[70vh] object-contain"
                  >
                    <source src={selectedReel.videoUrl} type="video/mp4" />
                  </video>
                  <div className="p-4">
                    <Title level={4}>{selectedReel.title}</Title>
                    <Paragraph>{selectedReel.viewCount} views</Paragraph>
                  </div>
                </div>
              </div>
            )}


            {/* Owner Info */}
            {prop.owner && (
              <Card
                className="shadow-md rounded-xl"
                title={<Title level={4}>Owner Information</Title>}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100">
                    <UserOutlined className="text-cyan-600 text-2xl" />
                  </div>
                  <div className="flex-1">
                    <Text strong className="text-lg block">{prop.owner.name}</Text>
                    <Paragraph className="text-gray-600 mb-1">
                      <PhoneOutlined className="mr-2 text-cyan-600 rotate-180" />
                      {prop.owner.phone || "N/A"}
                    </Paragraph>
                    <Paragraph className="text-gray-600">
                      <MailOutlined className="mr-2 text-cyan-600" />
                      {prop.owner.email || "N/A"}
                    </Paragraph>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="primary"
                      className="bg-cyan-600"
                      icon={<PhoneOutlined className="rotate-180" />}
                      href={`tel:${prop.owner.phone}`}
                    >
                      Call
                    </Button>
                    {/* <Button
          className="border-cyan-600 text-cyan-600"
          icon={<MessageOutlined />}
        >
          Message
        </Button> */}
                  </div>
                </div>
              </Card>
            )}


            {/* Features */}
            <Card
              className="shadow-md rounded-xl"
              title={<Title level={4}>Features</Title>}
            >
              {prop.features?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {prop.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded-lg shadow-sm border hover:shadow-md transition bg-gradient-to-r from-cyan-50 to-blue-50"
                    >
                      <AppstoreOutlined className="text-cyan-600 text-lg" />
                      <Text className="text-gray-700">{feature}</Text>
                    </div>
                  ))}
                </div>
              ) : (
                <Paragraph className="text-gray-500">No features listed.</Paragraph>
              )}
            </Card>

            {/* Gallery */}
            {prop.imageUrls?.length > 0 && (
              <Card
                className="shadow-md rounded-xl"
                title={<Title level={4}>Gallery</Title>}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {prop.imageUrls.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Gallery ${idx}`}
                      className="rounded-lg shadow-sm object-cover w-full h-40"
                    />
                  ))}
                </div>
              </Card>
            )}
          </div>



          {/* Map */}
          {prop.latitude && prop.longitude && (
            <div className="p-4 sm:p-8">
              <Title level={4} className="mb-4 flex items-center gap-2">
                <EnvironmentOutlined className="text-cyan-600" /> Location
              </Title>
              <iframe
                title="Property Location"
                className="w-full h-[250px] sm:h-[400px] rounded-xl shadow-md"
                src={`https://www.google.com/maps?q=${prop.latitude},${prop.longitude}&hl=es;z=14&output=embed`}
              ></iframe>
            </div>
          )}

          {/* Video */}
          {prop.videoUrl && (
            <div className="p-4 sm:p-8 max-h-[700px] ">
              <Title level={4} className="mb-4 flex items-center gap-2">
                <VideoCameraOutlined className="text-cyan-600" /> Video Tour
              </Title>
              <video className="w-full rounded-xl shadow-lg max-h-[500px] p-2" controls>
                <source src={prop.videoUrl} type="video/mp4" className="rounded-2xl"/>
              </video>
            </div>
          )}
          {/* Reviews Section */}
          
          <Divider />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;






{/* <Card title="Reviews" className="shadow rounded-xl"> */}
            {/* {reviewsLoading ? (
              <Spin />
            ) : reviews.length === 0 ? (
              <Empty description="No reviews yet." />
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <Text strong>{review.user || "Anonymous"}</Text>
                      <span className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`${i < review.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                          />
                        ))}
                      </span>
                    </div>
                    <Paragraph className="mb-1">{review.comment}</Paragraph>
                    <small className="text-gray-500">
                      {new Date().toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            )} */}

            {/* Review Form */}

            
            {/* <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block mb-1">Rating</label>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      onClick={() => handleRatingChange(i + 1)}
                      className={`cursor-pointer text-2xl ${i < reviewForm.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-1">Comment</label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  rows={3}
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  placeholder="Share your experience..."
                />
              </div>
              <Button type="primary" htmlType="submit" className="bg-cyan-600">
                Submit Review
              </Button>
            </form> */}
          // </Card>