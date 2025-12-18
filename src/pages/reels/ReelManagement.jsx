import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNearbyReels,
  deleteReel,
  likeReel,
  unlikeReel,
} from "../../redux/slices/reelsSlice";
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
 
  Tooltip,
  Spin,
  Card,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  LikeOutlined,
  DislikeOutlined,
  VideoCameraOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ReelDetail from "./ReelDetail";
import { toastError, toastSuccess } from "../../utils/toast";

const ReelManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reels, loading } = useSelector((state) => state.reels);

  const [selectedReel, setSelectedReel] = useState(null);

  useEffect(() => {
    dispatch(
      fetchNearbyReels({
        radiusKm: 50,
        latitude: 20.7749,
        longitude: 75.459,
      })
    );
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteReel(id))
      .unwrap()
      .then(() => toastSuccess("Reel deleted successfully"))
      .catch(() => toastError("Failed to delete reel"));
  };

  const handleLikeToggle = (reel) => {
    if (reel.liked) {
      dispatch(unlikeReel(reel.id));
    } else {
      dispatch(likeReel(reel.id));
    }
  };

  const columns = [
    
 {
  title: "Video",
  dataIndex: "videoUrl",
  key: "videoUrl",
  render: (_, record) => (
    <div className="flex justify-center">
      {record.videoUrl ? (
        <video
          src={record.videoUrl}
        
          controls={false}             // no controls in table
          muted                        // helps autoplay preview later
          className="w-28 h-24 sm:w-32 sm:h-24 object-cover rounded-lg shadow"
        />
      ) : (
        <VideoCameraOutlined className="text-2xl text-gray-400" />
      )}
    </div>
  ),
},
// {
//   title: "Thumbnail",
//   dataIndex: "thumbnailUrl",
//   key: "thumbnailUrl",
//   render: (_, record) => (
//     <div className="flex justify-center">
//       {record.thumbnailUrl ? (
//         <img
//           src={record.thumbnailUrl}
//           alt="thumbnail"
//           className="w-28 h-24 sm:w-32 sm:h-24 object-cover rounded-lg shadow"
//         />
//       ) : (
//         <VideoCameraOutlined className="text-2xl text-gray-400" />
//       )}
//     </div>
//   ),
// },


    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span className="text-gray-800 text-sm sm:text-base font-medium">
          {text}
        </span>
      ),
      responsive: ["sm", "md", "lg"],
    },
    {
      title: "Views",
      dataIndex: "viewCount",
      key: "viewCount",
      render: (count) => <Tag color="blue">{count} Views</Tag>,
      responsive: ["sm", "md", "lg"],
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString() : "Not available",
      responsive: ["md", "lg"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space
          size="middle"
          className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-0"
        >
          {/* View Reel */}
          <Tooltip title="View Reel">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => setSelectedReel(record)}
            />
          </Tooltip>

          {/* Like/Unlike */}
          <Tooltip title={record.liked ? "Unlike Reel" : "Like Reel"}>
            <Button
              type="link"
              onClick={() => handleLikeToggle(record)}
              icon={
                record.liked ? (
                  <DislikeOutlined className="text-red-500" />
                ) : (
                  <LikeOutlined className="text-green-500" />
                )
              }
            />
          </Tooltip>

          {/* Delete */}
          <Popconfirm
            title="Are you sure to delete this reel?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="link" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg"],
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md">
      {!selectedReel ? (
        <>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            🎬 Reel Management
          </h2>
          <div className="bg-[#f5f5f5c5] rounded-md">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                dataSource={reels}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 6, responsive: true }}
                bordered
                scroll={{ x: "max-content" }}
              />
            )}
          </div>
        </>
      ) : (
       <ReelDetail selectedReel={selectedReel} setSelectedReel={setSelectedReel} navigate={navigate} />
      )}
    </div>
  );
};

export default ReelManagement;
