import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchBanquetById,
  fetchBanquetReels,
  fetchAverageRating,
} from "../../redux/slices/hotelBanquetSlice";
import {
  Spin,
  Card,
  Typography,
  Row,
  Col,
  Divider,
  Rate,
  Tag,
  Empty,
  Carousel,
  Modal,
  Button,
  Popconfirm,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const { Title, Paragraph, Text } = Typography;

const BanquetDetails = () => {
  const { banquetId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    banquetDetails,
    reels,
    averageRatings,
    loading,
  } = useSelector((state) => state.hotelBanquet);
  const { user, role } = useSelector((state) => state.auth); // Assumes auth slice with user and role
console.log(banquetDetails, "banquetDetails", reels, "reels", averageRatings, "averageRatings");
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    if (banquetId) {
      dispatch(fetchBanquetById(banquetId)).catch(() =>
        toast.error("Failed to load banquet details")
      );
      dispatch(fetchBanquetReels(banquetId)).catch(() =>
        toast.error("Failed to load reels")
      );
      dispatch(fetchAverageRating({ type: "banquet", id: banquetId })).catch(() =>
        toast.error("Failed to load rating")
      );
    }
  }, [dispatch, banquetId]);

  const handleReelClick = (videoUrl) => {
    setCurrentVideo(videoUrl);
    setIsVideoModalVisible(true);
  };

  const handleDeleteReel = async (reelId) => {
    try {
      await dispatch(deleteReel(reelId)).unwrap(); // Assumes deleteReel action from previous code
      toast.success("Reel deleted successfully");
      dispatch(fetchBanquetReels(banquetId)); // Refresh reels
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

  if (!banquetDetails?.data) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty description="No Banquet Data Found" />
      </div>
    );
  }

  const banquet = banquetDetails.data;
  const avgRating = averageRatings?.data?.averageRating || 0;
  const totalReviews = averageRatings?.data?.totalReviews || 0;
  const reelsList = reels?.data?.reels || [];
  const videosList = banquet.videos || [];
  const imagesList = banquet.images || [];
  const reviewsList = banquet.reviews || []; // Assumes reviews are included; fetch separately if needed

  const isOwnerOrAdmin = role === "admin" || (role === "owner" && banquet.userId === user?._id);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Video Modal */}
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

      {/* Banquet Basic Info */}
      <Card style={{ marginBottom: "20px", borderRadius: "10px" }}>
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2} style={{ marginBottom: 0 }}>
              {banquet.name}
            </Title>
            <Rate disabled value={Number(avgRating)} allowHalf />
            {/* <Text type="secondary" style={{ marginLeft: "10px" }}>
              {Number(avgRating).toFixed(1)} / 5 ({totalReviews} reviews)
            </Text> */}
            <Paragraph style={{ marginTop: "10px" }}>
              {banquet.description || "No description available"}
            </Paragraph>
            <p>
              <strong>Capacity:</strong> {banquet.capacity || "N/A"}
            </p>
            <p>
              <strong>Price per Event:</strong> ₹{banquet.pricePerEvent || "N/A"}
            </p>
            <p>
              <strong>Event Types:</strong>{" "}
              {banquet.eventTypes?.map((type, idx) => (
                <Tag key={idx} color="blue">
                  {type}
                </Tag>
              )) || "None"}
            </p>
            <p>
              <strong>Catering Options:</strong>{" "}
              {banquet.cateringOptions?.map((option, idx) => (
                <Tag key={idx} color="green">
                  {option}
                </Tag>
              )) || "None"}
            </p>
            <p>
              <strong>City:</strong> {banquet.city || "N/A"}
            </p>
            <p>
              <strong>State:</strong> {banquet.state || "N/A"}
            </p>
            <p>
              <strong>Pincode:</strong> {banquet.pincode || "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <Tag color={banquet.status === "approved" ? "green" : "orange"}>
                {banquet.status}
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
                    alt={`Banquet image ${idx + 1}`}
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
                alt="No banquet"
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
                {isOwnerOrAdmin && (
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
                )}
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

export default BanquetDetails;