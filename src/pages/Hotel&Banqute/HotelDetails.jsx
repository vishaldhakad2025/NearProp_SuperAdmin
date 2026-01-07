import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchHotelById,
  fetchRoomsByHotel,
  fetchHotelReels,
  fetchAverageRating,
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
} from "antd";
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
      dispatch(fetchHotelById(hotelId));
      dispatch(fetchRoomsByHotel(hotelId));
      dispatch(fetchHotelReels(hotelId));
      dispatch(fetchAverageRating({ type: "hotel", id: hotelId }));
    }
  }, [dispatch, hotelId]);

  const handleRoomClick = (roomId) => {
    navigate(`/dashboard/rooms/${roomId}`);
  };

  const handleReelClick = (videoUrl) => {
    setCurrentVideo(videoUrl);
    setIsVideoModalVisible(true);
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
  const avgRating = averageRatings?.data?.averageRating || hotel.averageRating || 0;
  const totalReviews = averageRatings?.data?.totalReviews || hotel.reviewCount || 0;
  const roomsList = rooms?.data?.rooms || hotel.rooms || [];
  const reelsList = reels?.data?.reels || hotel.reels?.items || [];
  const videosList = hotel.videos || [];
  const imagesList = hotel.images || [];
  const reviewsList = hotel.reviews?.items || [];

  const renderAmenities = (amenities) => {
    if (!amenities || amenities.length === 0) {
      return <Text type="secondary">—</Text>;
    }

    return amenities.slice(0, 5).map((a, idx) => (
      <Tag color="blue" key={idx}>
        {a}
      </Tag>
    ));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Button
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start"
        }}
        onClick={() => navigate(-1)}
      >
        <BiLeftArrow style={{ marginRight: "8px" }} /> Back
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

      <Card style={{ marginBottom: "20px", borderRadius: "10px" }}>
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2} style={{ marginBottom: 0 }}>
              {hotel.name}
            </Title>
            <Rate disabled value={Number(avgRating)} allowHalf />
            <Text type="secondary" style={{ marginLeft: "10px" }}>
              {Number(avgRating).toFixed(1)} / 5 ({totalReviews} reviews)
            </Text>
            <Paragraph style={{ marginTop: "10px" }}>
              {hotel.description || "No description available"}
            </Paragraph>
            <Card title="Amenities">
              {renderAmenities(hotel.amenities)}
            </Card>
            <p style={{ marginTop: "10px" }}>
              <strong>Address:</strong> {hotel.address || "N/A"}
            </p>
            <p>
              <strong>City:</strong> {hotel.city || "N/A"}
            </p>
            <p>
              <strong>State:</strong> {hotel.state || "N/A"}
            </p>
            <p>
              <strong>Pincode:</strong> {hotel.pincode || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {hotel.contactNumber || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {hotel.email || "N/A"}
            </p>
            <p>
              <strong>Website:</strong> {hotel.website ? <a href={hotel.website} target="_blank" rel="noopener noreferrer">{hotel.website}</a> : "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <Tag color={hotel.status === "approved" ? "green" : "orange"}>
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

      <Divider orientation="left">Rooms ({roomsList.length})</Divider>
      <Row gutter={[16, 16]}>
        {roomsList.length > 0 ? (
          roomsList.map((room) => (
            <Col xs={24} sm={12} md={8} key={room._id}>
              <Card
                hoverable
                onClick={() => handleRoomClick(room._id)}
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

      {videosList.length > 0 && (
        <>
          <Divider orientation="left">Videos ({videosList.length})</Divider>
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

      <Divider orientation="left">Reels ({reelsList.length})</Divider>
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

      <Divider orientation="left">Reviews ({reviewsList.length})</Divider>
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