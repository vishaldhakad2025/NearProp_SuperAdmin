import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchHotelById,
  fetchRoomsByHotel,
  fetchHotelReels,
  fetchAverageRating,
  // deleteReel,
} from "../../redux/slices/hotelBanquetSlice";
import {
  Spin,
  Card,
  List,
  Typography,
  Row,
  Col,
  Divider,
  Rate,
  Avatar,
  Tag,
  Empty,
  Carousel,
  Modal,
  Button,
  Popconfirm,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { BiLeftArrow } from "react-icons/bi";

const { Title, Paragraph, Text } = Typography;

const HotelDetails = () => {
  const { hotelId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    hotelDetails,
    rooms,
    reels,
    averageRatings,
    loading,
  } = useSelector((state) => state.hotelBanquet);

  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    if (hotelId) {
      dispatch(fetchHotelById(hotelId)).catch(() =>
        toast.error("Failed to load hotel details")
      );
      dispatch(fetchRoomsByHotel(hotelId)).catch(() =>
        toast.error("Failed to load rooms")
      );
      dispatch(fetchHotelReels(hotelId)).catch(() =>
        toast.error("Failed to load reels")
      );
      dispatch(fetchAverageRating({ type: "hotel", id: hotelId })).catch(() =>
        toast.error("Failed to load rating")
      );
    }
  }, [dispatch, hotelId]);

  const handleRoomClick = (roomId) => {
    navigate(`/dashboard/rooms/${roomId}`);
  };

  const handleReelClick = (videoUrl) => {
    setCurrentVideo(videoUrl);
    setIsVideoModalVisible(true);
  };

  const handleDeleteReel = async (reelId) => {
    try {
      // await dispatch(deleteReel(reelId)).unwrap();
      // toast.success("Reel deleted successfully");
      // dispatch(fetchHotelReels(hotelId)); // Refresh reels
    } catch (error) {
      toast.error("Failed to delete reel");
    }
  };

  const handleVideoModalClose = () => {
    setIsVideoModalVisible(false);
    setCurrentVideo(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!hotelDetails?.data) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty description="No Hotel Data Found" />
      </div>
    );
  }

  const hotel = hotelDetails.data;
  const avgRating = averageRatings?.data?.averageRating || 0;
  const totalReviews = averageRatings?.data?.totalReviews || 0;
  const roomsList = rooms?.data?.rooms || [];
  const reelsList = reels?.data?.reels || [];
  const videosList = hotel.videos || [];
  const imagesList = hotel.images || [];
  const reviewsList = hotel.reviews || []; // Assumes reviews are included; fetch separately if needed

  // const isOwnerOrAdmin = role === "admin" || (role === "owner" && hotel.userId === user?._id);

  const renderAmenities = (amenities) => {
    if (!amenities || amenities.length === 0) return null;

    let arr = [];

    // If it's an array with a single string like '["AC","Swimming","Gym",]'
    if (Array.isArray(amenities) && typeof amenities[0] === "string") {
      try {
        arr = JSON.parse(amenities[0].replace(/,\s*]$/, "]"));
      } catch (err) {
        console.error("Failed to parse amenities:", err);
        return null;
      }
    } else if (Array.isArray(amenities)) {
      // Already a proper array
      arr = amenities;
    } else if (typeof amenities === "string") {
      try {
        arr = JSON.parse(amenities.replace(/,\s*]$/, "]"));
      } catch (err) {
        console.error("Failed to parse amenities string:", err);
        return null;
      }
    }

    return arr.map((a, idx) => (
      <Tag color="blue" key={idx}>
        {a}
      </Tag>
    ));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Video Modal */}
      <Button className="felx justify-around items-center" onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>
        <BiLeftArrow />  Back
      </Button>
      <Modal
        visible={isVideoModalVisible}
        footer={null}
        onCancel={handleVideoModalClose}
        width={800}
        centered
        destroyOnClose
      >
        {currentVideo && (
          <video
            controls
            src={currentVideo}
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "contain",
            }}
            autoPlay
          />
        )}
      </Modal>

      {/* Hotel Basic Info */}
      <Card style={{ marginBottom: "20px", borderRadius: "10px" }}>
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2} style={{ marginBottom: 0 }}>
              {hotel.name}
            </Title>
            <Rate disabled value={Number(avgRating)} allowHalf />
            <Text type="secondary" style={{ marginLeft: "10px" }}>
              {/* {Number(avgRating).toFixed(0)} / 5   */}
              {/* ({totalReviews} reviews) */}
            </Text>
            <Paragraph style={{ marginTop: "10px" }}>
              {hotel.description || "No description available"}
            </Paragraph>
            <Card title="Amenities">
              {renderAmenities(hotel.amenities) || "—"}
            </Card>
            <p style={{ marginTop: "10px" }}>
              <strong>City:</strong> {hotel.city || "N/A"}
            </p>
            <p>
              <strong>State:</strong> {hotel.state || "N/A"}
            </p>
            <p>
              <strong>Pincode:</strong> {hotel.pincode || "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <Tag
                color={hotel.status === "approved" ? "green" : "orange"}
              >
                {hotel.status}
              </Tag>
            </p>
          </Col>
          <Col xs={24} md={8}>
            {imagesList.length > 0 ? (
              <Carousel autoplay>
                {imagesList.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Hotel image ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ))}
              </Carousel>
            ) : (
              <img
                src="/placeholder.jpg"
                alt="No hotel"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
            )}
          </Col>
        </Row>
      </Card>

      {/* Rooms */}
      <Divider orientation="left">Rooms</Divider>
      <Row gutter={[16, 16]}>
        {roomsList.length > 0 ? (
          roomsList.map((room) => (
            <Col xs={24} sm={12} md={8} key={room._id}>
              <Card
                hoverable
                onClick={() => handleRoomClick(room?._id)}
                cover={
                  <img
                    alt={room.type}
                    src={room.images?.[0] || "/room-placeholder.jpg"}
                    style={{
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />
                }
              >
                <Title level={4}>{room.type}</Title>
                <p>Room No: {room.roomNumber}</p>
                {room.finalPrice && <p>Price: ₹{room.finalPrice}</p>}
                {room.inventoryCount && <p>Available: {room.inventoryCount} rooms</p>}
                <p>
                  <strong>Features:</strong>{" "}
                  {room.features?.join(", ") || "None"}
                </p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="No rooms available" />
          </Col>
        )}
      </Row>

      {/* Videos */}
      {videosList.length > 0 && (
        <>
          <Divider orientation="left">Videos</Divider>
          <Row gutter={[16, 16]}>
            {videosList.map((vid, idx) => (
              <Col xs={24} sm={12} md={8} key={idx}>
                <video
                  controls
                  src={vid}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    maxHeight: "250px",
                    objectFit: "cover",
                  }}
                  onClick={() => handleReelClick(vid)}
                />
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Reels */}
      <Divider orientation="left">Reels</Divider>
      {reelsList.length > 0 ? (
        <Row gutter={[16, 16]}>
          {reelsList.map((reel) => (
            <Col xs={24} sm={12} md={8} key={reel._id}>
              <div style={{ position: "relative" }}>
                <video
                  src={reel.content}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    maxHeight: "250px",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => handleReelClick(reel.content)}
                />

                <Popconfirm
                  title="Are you sure you want to delete this reel?"
                  onConfirm={() => handleDeleteReel(reel._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="danger"
                    shape="circle"
                    icon={<DeleteOutlined />}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      zIndex: 10,
                    }}
                  />
                </Popconfirm>

                <div style={{ marginTop: "8px" }}>
                  <Text strong>{reel.title}</Text>
                  <br />
                  <Text type="secondary">
                    {reel.viewCount} views • {reel.likesCount} likes • {reel.shareCount} shares
                  </Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="No reels available" />
      )}

      {/* Reviews */}
      <Divider orientation="left">Reviews</Divider>
      {reviewsList.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={reviewsList}
          renderItem={(review, idx) => (
            <List.Item key={idx}>
              <List.Item.Meta
                avatar={<Avatar src={review.userAvatar} />}
                title={
                  <>
                    {review.userName}{" "}
                    <Rate
                      disabled
                      value={review.rating}
                      style={{
                        fontSize: "14px",
                        marginLeft: "5px",
                      }}
                    />
                  </>
                }
                description={new Date(review.createdAt).toLocaleDateString()}
              />
              <p>{review.comment}</p>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No reviews yet" />
      )}
    </div>
  );
};

export default HotelDetails;