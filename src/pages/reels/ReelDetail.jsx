import {
  ArrowLeftOutlined,
  HomeOutlined,
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Button, Card, List, Avatar, Divider, Tag } from "antd";
import dayjs from "dayjs";

const ReelDetail = ({ selectedReel, setSelectedReel, navigate }) => {
  return (
    <div>
      {/* Back Button */}
      <Button
        icon={<ArrowLeftOutlined />}
        type="link"
        className="mb-4"
        onClick={() => setSelectedReel(null)}
      >
        Back to Reels
      </Button>

      {/* Reel Detail Card */}
      <Card
        title={
          <span className="text-base sm:text-lg font-semibold">
            {selectedReel.title}
          </span>
        }
        extra={
          <Button
            icon={<HomeOutlined />}
            type="primary"
            size="small"
            onClick={() =>
              navigate(`/dashboard/properties/${selectedReel.propertyId}`)
            }
          >
            View Property
          </Button>
        }
        className="shadow-md"
      >
        <div>

            {/* Video */}
        <video
          src={selectedReel.videoUrl}
          poster={selectedReel.thumbnailUrl}
          controls
          className="w-full max-h-[400px] rounded-lg mb-4"
        />
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-6 mb-4 text-gray-700 text-sm sm:text-base">
          <span>
            <EyeOutlined /> {selectedReel.viewCount} Views
          </span>
          <span>
            <LikeOutlined /> {selectedReel.likeCount} Likes
          </span>
          <span>
            <CommentOutlined /> {selectedReel.commentCount} Comments
          </span>
          <span>
            <ShareAltOutlined /> {selectedReel.shareCount} Shares
          </span>
          {/* <span>
            <SaveOutlined /> {selectedReel.saveCount} Saves
          </span> */}
        </div>

        <Divider />

        {/* Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm sm:text-base">
          <p>
            <strong>City:</strong> {selectedReel.city}
          </p>
          <p>
            <strong>State:</strong> {selectedReel.state}
          </p>
          <p>
            <strong>District:</strong> {selectedReel.district}
          </p>
          <p>
            <strong>Distance:</strong> {selectedReel.distanceKm.toFixed(1)} km
          </p>
        </div>

        {/* Owner Info */}
        <Card size="small" title="Owner Information" className="mb-4">
          <p>
            <strong>Name:</strong> {selectedReel.owner?.name}
          </p>
          <p>
            <strong>Email:</strong> {selectedReel.owner?.email}
          </p>
          <p>
            <strong>Mobile:</strong> {selectedReel.owner?.mobileNumber}
          </p>
        </Card>

        {/* Comments List */}
        {selectedReel.comments?.length > 0 && (
          <Card size="small" title="Recent Comments" className="mb-4">
            <List
              itemLayout="horizontal"
              dataSource={selectedReel.comments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar>{item.user?.name?.charAt(0) || "U"}</Avatar>
                    }
                    title={<span>{item.user?.name}</span>}
                    description={item.comment}
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Meta Info */}
        <div className="text-xs text-gray-500">
          <p>
            <strong>Duration:</strong> {selectedReel.durationSeconds}s
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {dayjs(selectedReel.createdAt).format("DD MMM YYYY, hh:mm A")}
          </p>
          <p>
            <strong>Updated:</strong>{" "}
            {dayjs(selectedReel.updatedAt).format("DD MMM YYYY, hh:mm A")}
          </p>
          <p>
            <Tag color="green">{selectedReel.status}</Tag>
            <Tag color="blue">{selectedReel.processingStatus}</Tag>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ReelDetail;
