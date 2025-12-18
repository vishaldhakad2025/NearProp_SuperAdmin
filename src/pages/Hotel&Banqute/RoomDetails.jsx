import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchRoomById } from "../../redux/slices/hotelBanquetSlice";
import {
  Spin,
  Card,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Empty,
  Carousel,
  Button,
  Rate,
  Avatar,
  List,
} from "antd";
import { toast } from "react-toastify";
import { BiLeftArrow } from "react-icons/bi";

const { Title, Paragraph, Text } = Typography;

const RoomDetails = () => {
  const { roomId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { roomDetails, loading } = useSelector((state) => state.hotelBanquet);

  useEffect(() => {
    if (roomId) {
      dispatch(fetchRoomById(roomId)).catch(() =>
        toast.error("Failed to load room details")
      );
    }
  }, [dispatch, roomId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!roomDetails?.data) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty description="No Room Data Found" />
      </div>
    );
  }

  const room = roomDetails.data;
  const imagesList = room.images || [];
  const featuresList = room.features || [];
  const servicesList = room.services || [];
  const seasonalPrice = room.seasonalPrice || {};
  const reviewsList = room.reviews || [];
  const hotel = room.hotelDetails;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Back button */}
      <Button className="felx justify-around items-center" onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>
      <BiLeftArrow />  Back to Hotel
      </Button>

      {/* Room Info */}
      <Card style={{ marginBottom: "20px", borderRadius: "10px" }}>
        <Row gutter={[20, 20]} align="middle">
          {/* Room Details */}
          <Col xs={24} md={16}>
            <Title level={2} style={{ marginBottom: 0 }}>
              {room.type} (Room No: {room.roomNumber})
            </Title>
            <Paragraph style={{ marginTop: "10px" }}>
              {room.description || "No description available"}
            </Paragraph>

            <p>
              <strong>Base Price:</strong>{" "}
              <Text strong>₹{room.finalPrice || room.price || "N/A"}</Text>
            </p>

            {/* Seasonal Pricing */}
            {Object.keys(seasonalPrice).length > 0 && (
              <>
                <Divider orientation="left">Seasonal Pricing</Divider>
                <Row gutter={[10, 10]}>
                  {Object.entries(seasonalPrice).map(([season, price]) => (
                    <Col key={season}>
                      <Tag color="blue">
                        {season.charAt(0).toUpperCase() + season.slice(1)}: ₹
                        {price}
                      </Tag>
                    </Col>
                  ))}
                </Row>
              </>
            )}

            <p>
              <strong>Availability:</strong>{" "}
              <Tag color={room.isAvailable ? "green" : "red"}>
                {room.isAvailable ? "Available" : "Not Available"}
              </Tag>
            </p>
            <p>
              <strong>Inventory Count:</strong>{" "}
              {room.inventoryCount || "N/A"} rooms
            </p>

            <Divider />

            {/* Features & Services */}
            <p>
              <strong>Features:</strong>{" "}
              {featuresList.length > 0
                ? featuresList.map((f) => (
                    <Tag color="purple" key={f}>
                      {f}
                    </Tag>
                  ))
                : "None"}
            </p>

            <p>
              <strong>Services:</strong>{" "}
              {servicesList.length > 0
                ? servicesList.map((s) => (
                    <Tag color="cyan" key={s}>
                      {s}
                    </Tag>
                  ))
                : "None"}
            </p>
          </Col>

          {/* Images Carousel */}
          <Col xs={24} md={8}>
            {imagesList.length > 0 ? (
              <Carousel autoplay>
                {imagesList.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Room image ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ))}
              </Carousel>
            ) : (
              <img
                src="/room-placeholder.jpg"
                alt="No room image"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "250px",
                  objectFit: "cover",
                }}
              />
            )}
          </Col>
        </Row>
      </Card>

      {/* Hotel Info */}
      {hotel && (
        <Card title="Hotel Details" style={{ marginBottom: "20px" }}>
          <Row gutter={[20, 20]}>
            <Col xs={24} md={8}>
              <img
                src={hotel.images?.[0] || "/hotel-placeholder.jpg"}
                alt="Hotel"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </Col>
            <Col xs={24} md={16}>
              <Title level={4}>{hotel.name}</Title>
              <Paragraph>{hotel.description}</Paragraph>
              <p>
                <strong>Location:</strong> {hotel.address}, {hotel.city},{" "}
                {hotel.state}
              </p>
              <p>
                <strong>Contact:</strong> {hotel.contactNumber} |{" "}
                {hotel.email}
              </p>
              <Button
                type="primary"
                onClick={() => navigate(`/dashboard/all-hotels/${hotel.hotelId}`)}
              >
                View Hotel
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Ratings & Reviews */}
      <Card title="Customer Reviews">
        {reviewsList.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={reviewsList}
            renderItem={(review) => (
              <List.Item
                key={review._id}
                extra={<Rate disabled defaultValue={review.rating} />}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={review.userId?.profileImage || ""}>
                      {review.userId?.name?.[0]}
                    </Avatar>
                  }
                  title={review.userId?.name}
                  description={review.comment}
                />
                <Text type="secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No reviews yet" />
        )}
      </Card>
    </div>
  );
};

export default RoomDetails;
