// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchAllAdvertisements,
//   fetchAdvertisementById,
//   createAdvertisement,
//   deleteAdvertisement,
// } from "../../redux/slices/subAdminSlice";
// import {
//   Button,
//   Table,
//   Modal,
//   Form,
//   Input,
//   Tag,
//   message,
//   Spin,
//   Card,
//   Space,
//   Typography,
//   Popconfirm,
//   Divider,
//   Row,
//   Col,
//   Image,
//   DatePicker,
//   Upload,
// } from "antd";
// import {
//   FileAddOutlined,
//   UserOutlined,
//   EyeOutlined,
//   DeleteOutlined,
//   UploadOutlined,
// } from "@ant-design/icons";
// import moment from "moment";

// const { Text, Title } = Typography;

// const AdvertisementManagement = () => {
//   const dispatch = useDispatch();
//   const {
//     advertisements = [],
//     advLoading = false,
//     advCreating = false,
//   } = useSelector((state) => state.subAdmin || {});

//   const auth = useSelector((s) => s.auth || {});
//   const currentUser = auth.currentUser || auth.user || auth.profile || null;
//   const currentUserId = currentUser?.id || currentUser?._id;

//   const { currentAd, adLoading } = useSelector((state) => state.subAdmin);

//   const [bannerFileList, setBannerFileList] = React.useState([]);
//   // const [videoFileList, setVideoFileList] = React.useState([]);

//   const [createOpen, setCreateOpen] = React.useState(false);
//   const [viewOpen, setViewOpen] = React.useState({ open: false, ad: null });
//   const [myAds, setMyAds] = React.useState([]);
//   const [form] = Form.useForm();

//   // Load ads
//   useEffect(() => {
//     dispatch(fetchAllAdvertisements());
//   }, [dispatch]);

//   // Filter only my ads
//   // useEffect(() => {
//   //     if (Array.isArray(advertisements) && currentUserId) {
//   //         const filtered = advertisements.filter(
//   //             (ad) => String(ad.createdBy?.id || ad.createdBy?._id) === String(currentUserId)
//   //         );
//   //         setMyAds(filtered);
//   //     } else {
//   //         setMyAds([]);
//   //     }
//   // }, [advertisements, currentUserId]);

//   useEffect(() => {
//     if (Array.isArray(advertisements)) {
//       setMyAds(advertisements); // show all ads
//     } else {
//       setMyAds([]);
//     }
//   }, [advertisements]);

//   const openCreate = () => {
//     form.resetFields();
//     setCreateOpen(true);
//   };

//   const handleCreate = async (values) => {
//     const formData = new FormData();

//     // Add all text input fields
//     const allFields = [
//       "title",
//       "description",
//       "bannerImageUrl",
//       "websiteUrl",
//       "whatsappNumber",
//       "phoneNumber",
//       "emailAddress",
//       "additionalInfo",
//       "targetLocation",
//       "latitude",
//       "longitude",
//       "radiusKm",
//       "districtId",
//     ];

//     allFields.forEach((key) => {
//       if (values[key]) formData.append(key, values[key]);
//     });

//     // Dates
//     if (values.validFrom) {
//       formData.append("validFrom", values.validFrom.toISOString());
//     }
//     if (values.validUntil) {
//       formData.append("validUntil", values.validUntil.toISOString());
//     }

//     // Multiple district ids
//     //   if (values.targetDistrictIds?.length > 0) {
//     //     values.targetDistrictIds.forEach((id) =>
//     //       formData.append("targetDistrictIds", id)
//     //     );
//     //   }

//     // Multiple district ids
//     if (values.targetDistrictIds) {
//       const districts = values.targetDistrictIds
//         .split(",") // split by comma
//         .map((id) => id.trim()) // remove extra spaces
//         .filter(Boolean); // remove empty strings

//       districts.forEach((id) => formData.append("targetDistrictIds", id));
//     }

//     // Banner file
//     if (bannerFileList?.length > 0) {
//       formData.append("bannerImage", bannerFileList[0].originFileObj);
//     }

//     // Video file
//     // if (videoFileList?.length > 0) {
//     //     formData.append("videoFile", videoFileList[0].originFileObj);
//     // }

//     const result = await dispatch(createAdvertisement(formData));

//     if (createAdvertisement.fulfilled.match(result)) {
//       message.success("Advertisement created successfully!");
//       form.resetFields();
//       setBannerFileList([]);
//       // setVideoFileList([]);
//       setCreateOpen(false);
//       dispatch(fetchAllAdvertisements());
//     } else {
//       message.error(
//         result.payload?.message || "Failed to create advertisement"
//       );
//     }
//   };
//   // const { currentAd, adLoading } = useSelector((state) => state.subAdmin);

//   const openView = async (id) => {
//     setViewOpen({ open: true }); // just open modal
//     const result = await dispatch(fetchAdvertisementById(id));
//     setViewOpen((prev) => ({ ...prev, ad: result.payload }));

//     console.log("Thunk result:", result);
//   };

//   const columns = [
//     {
//       title: "Banner",
//       dataIndex: "bannerImageUrl",
//       render: (url) =>
//         url ? (
//           <Image
//             src={url}
//             width={100}
//             height={60}
//             style={{ objectFit: "cover" }}
//             preview={false}
//           />
//         ) : (
//           <Tag>No Image</Tag>
//         ),
//     },
//     {
//       title: "Title",
//       dataIndex: "title",
//       render: (t) => <Text strong>{t || "—"}</Text>,
//     },
//     { title: "Location", dataIndex: "targetLocation" },
//     {
//       title: "Valid From",
//       dataIndex: "validFrom",
//       render: (d) => (d ? moment(d).format("DD MMM YYYY") : "—"),
//     },
//     {
//       title: "Valid Until",
//       dataIndex: "validUntil",
//       render: (d) => (d ? moment(d).format("DD MMM YYYY") : "—"),
//     },
//     {
//       title: "Actions",
//       render: (_, rec) => (
//         <Space>
//           <Button
//             size="small"
//             icon={<EyeOutlined />}
//             onClick={() => openView(rec.id)}
//           />
//           <Popconfirm
//             title="Delete?"
//             onConfirm={() => dispatch(deleteAdvertisement(rec.id))}
//           >
//             <Button danger size="small" icon={<DeleteOutlined />} />
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
//       <Card
//         title={
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <Space>
//               <UserOutlined style={{ fontSize: 28, color: "#1890ff" }} />
//               <div>
//                 <Title level={3} style={{ margin: 0 }}>
//                   My Advertisements
//                 </Title>
//                 <Text type="secondary">Create and manage your ads</Text>
//               </div>
//             </Space>
//             <Space>
//               <Button onClick={() => dispatch(fetchAllAdvertisements())}>
//                 Refresh
//               </Button>
//               <Button
//                 type="primary"
//                 icon={<FileAddOutlined />}
//                 onClick={openCreate}
//               >
//                 Create Advertisement
//               </Button>
//             </Space>
//           </div>
//         }
//         variant="outlined"
//       >
//         {advLoading ? (
//           <Spin tip="Loading..." style={{ display: "block", marginTop: 50 }} />
//         ) : myAds.length === 0 ? (
//           <div style={{ textAlign: "center", padding: 60 }}>
//             <Title level={4}>No advertisements yet</Title>
//             <Button type="primary" onClick={openCreate}>
//               Create Your First Ad
//             </Button>
//           </div>
//         ) : (
//           <Table
//             columns={columns}
//             dataSource={myAds}
//             rowKey="id"
//             pagination={{ pageSize: 10 }}
//           />
//         )}
//       </Card>

//       {/* CREATE MODAL */}
//       <Modal
//         title="Create Advertisement"
//         open={createOpen}
//         onCancel={() => setCreateOpen(false)}
//         footer={null}
//         width={900}
//         destroyOnHidden
//       >
//         <Form form={form} layout="vertical" onFinish={handleCreate}>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="title"
//                 label="Title"
//                 rules={[{ required: true }]}
//               >
//                 <Input />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="description" label="Description">
//                 <Input.TextArea rows={3} />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="websiteUrl" label="Website URL">
//                 <Input />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="emailAddress" label="Email Address">
//                 <Input />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="whatsappNumber" label="WhatsApp Number">
//                 <Input type="number" maxLength={10} />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="phoneNumber" label="Phone Number">
//                 <Input type="number" maxLength={10} />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="districtId" label="District ID">
//                 <Input />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="targetDistrictIds" label="Target District IDs">
//                 <Input placeholder="e.g. 319, 320 (comma separated)" />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="targetLocation" label="Target Location">
//                 <Input />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="latitude" label="Latitude">
//                 <Input />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="longitude" label="Longitude">
//                 <Input />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="radiusKm" label="Radius (KM)">
//                 <Input />
//               </Form.Item>
//             </Col>

//             <Col span={24}>
//               <Form.Item name="additionalInfo" label="Additional Info">
//                 <Input />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item
//                 name="validFrom"
//                 label="Valid From"
//                 rules={[{ required: true }]}
//               >
//                 <DatePicker showTime style={{ width: "100%" }} />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item
//                 name="validUntil"
//                 label="Valid Until"
//                 dependencies={["validFrom"]}
//                 rules={[
//                   { required: true, message: "Please select valid until date" },
//                   ({ getFieldValue }) => ({
//                     validator(_, value) {
//                       const validFrom = getFieldValue("validFrom");
//                       if (!value || !validFrom) {
//                         return Promise.resolve();
//                       }
//                       if (value.isBefore(validFrom)) {
//                         return Promise.reject(
//                           new Error("Valid Until must be after Valid From")
//                         );
//                       }
//                       return Promise.resolve();
//                     },
//                   }),
//                 ]}
//               >
//                 <DatePicker showTime style={{ width: "100%" }} />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item label="Banner Image" required>
//                 <Upload
//                   listType="picture-card"
//                   fileList={bannerFileList}
//                   beforeUpload={() => false}
//                   onChange={({ fileList }) => setBannerFileList(fileList)}
//                   maxCount={1}
//                 >
//                   Upload Banner
//                 </Upload>
//               </Form.Item>
//             </Col>

//             {/* Video File */}
//             {/* <Col span={12}>
//                             <Form.Item label="Video File">
//                                 <Upload
//                                     fileList={videoFileList}
//                                     beforeUpload={() => false}
//                                     onChange={({ fileList }) => setVideoFileList(fileList)}
//                                     maxCount={1}
//                                 >
//                                     Upload Video
//                                 </Upload>
//                             </Form.Item>
//                         </Col> */}
//           </Row>

//           <Divider />
//           <div style={{ textAlign: "right" }}>
//             <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={advCreating}
//               style={{ marginLeft: 8 }}
//             >
//               Create
//             </Button>
//           </div>
//         </Form>
//       </Modal>

//       {/* VIEW MODAL */}
//       <Modal
//         title="Advertisement Details"
//         open={viewOpen.open}
//         onCancel={() => setViewOpen({ open: false, ad: null })}
//         footer={null}
//         width={800}
//       >
//         {viewOpen.ad && (
//           <>
//             {viewOpen.ad.bannerImageUrl && (
//               <Image
//                 src={viewOpen.ad.bannerImageUrl}
//                 style={{ width: "100%", borderRadius: 8 }}
//               />
//             )}
//             <Divider />
//             <Row gutter={16}>
//               <Col span={12}>
//                 <Text strong>Title:</Text> {viewOpen.ad.title}
//               </Col>
//               <Col span={12}>
//                 <Text strong>Location:</Text> {viewOpen.ad.targetLocation}
//               </Col>
//               <Col span={12}>
//                 <Text strong>WhatsApp:</Text> {viewOpen.ad.whatsappNumber}
//               </Col>
//               <Col span={12}>
//                 <Text strong>Phone:</Text> {viewOpen.ad.phoneNumber}
//               </Col>
//               <Col span={24}>
//                 <Text strong>Description:</Text>
//                 <br />
//                 {viewOpen.ad.description}
//               </Col>
//               <Col span={12}>
//                 <Text strong>Valid From:</Text>
//                 <br />
//                 {moment(viewOpen.ad.validFrom).format("DD MMM YYYY, hh:mm A")}
//               </Col>
//               <Col span={12}>
//                 <Text strong>Valid Until:</Text>
//                 <br />
//                 {moment(viewOpen.ad.validUntil).format("DD MMM YYYY, hh:mm A")}
//               </Col>
//             </Row>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default AdvertisementManagement;


import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAdvertisements,
  fetchAdvertisementById,
  createAdvertisement,
  deleteAdvertisement,
} from "../../redux/slices/subAdminSlice";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Tag,
  message,
  Spin,
  Card,
  Space,
  Typography,
  Popconfirm,
  Divider,
  Row,
  Col,
  Image,
  DatePicker,
  Upload,
} from "antd";
import {
  FileAddOutlined,
  UserOutlined,
  EyeOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const AdvertisementManagement = () => {
  const dispatch = useDispatch();
  const {
    advertisements = [],
    advLoading = false,
    advCreating = false,
  } = useSelector((state) => state.subAdmin || {});

  const auth = useSelector((s) => s.auth || {});
  const currentUser = auth.currentUser || auth.user || auth.profile || null;
  const currentUserId = currentUser?.id || currentUser?._id;

  const { currentAd, adLoading } = useSelector((state) => state.subAdmin);

  const [bannerFileList, setBannerFileList] = React.useState([]);
  // const [videoFileList, setVideoFileList] = React.useState([]);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState({ open: false, ad: null });
  const [myAds, setMyAds] = React.useState([]);
  const [form] = Form.useForm();

  // Load ads
  useEffect(() => {
    dispatch(fetchAllAdvertisements());
  }, [dispatch]);

  // Filter only my ads
  // useEffect(() => {
  //     if (Array.isArray(advertisements) && currentUserId) {
  //         const filtered = advertisements.filter(
  //             (ad) => String(ad.createdBy?.id || ad.createdBy?._id) === String(currentUserId)
  //         );
  //         setMyAds(filtered);
  //     } else {
  //         setMyAds([]);
  //     }
  // }, [advertisements, currentUserId]);

  useEffect(() => {
    if (Array.isArray(advertisements)) {
      setMyAds(advertisements); // show all ads
    } else {
      setMyAds([]);
    }
  }, [advertisements]);

  const openCreate = () => {
    form.resetFields();
    setBannerFileList([]);
    setCreateOpen(true);
  };

  const handleCreate = async (values) => {
    // Validate banner image
    if (bannerFileList.length === 0) {
      message.error("Please upload a banner image");
      return;
    }

    const formData = new FormData();

    // Add all text input fields
    const allFields = [
      "title",
      "description",
      "bannerImageUrl",
      "websiteUrl",
      "whatsappNumber",
      "phoneNumber",
      "emailAddress",
      "additionalInfo",
      "targetLocation",
      "latitude",
      "longitude",
      "radiusKm",
      "districtId",
    ];

    allFields.forEach((key) => {
      if (values[key]) formData.append(key, values[key]);
    });

    // Dates
    if (values.validFrom) {
      formData.append("validFrom", values.validFrom.toISOString());
    }
    if (values.validUntil) {
      formData.append("validUntil", values.validUntil.toISOString());
    }

    // Multiple district ids
    //   if (values.targetDistrictIds?.length > 0) {
    //     values.targetDistrictIds.forEach((id) =>
    //       formData.append("targetDistrictIds", id)
    //     );
    //   }

    // Multiple district ids
    if (values.targetDistrictIds) {
      const districts = values.targetDistrictIds
        .split(",") // split by comma
        .map((id) => id.trim()) // remove extra spaces
        .filter(Boolean); // remove empty strings

      districts.forEach((id) => formData.append("targetDistrictIds", id));
    }

    // Banner file
    if (bannerFileList?.length > 0) {
      formData.append("bannerImage", bannerFileList[0].originFileObj);
    }

    // Video file
    // if (videoFileList?.length > 0) {
    //     formData.append("videoFile", videoFileList[0].originFileObj);
    // }

    const result = await dispatch(createAdvertisement(formData));

    if (createAdvertisement.fulfilled.match(result)) {
      message.success("Advertisement created successfully!");
      form.resetFields();
      setBannerFileList([]);
      // setVideoFileList([]);
      setCreateOpen(false);
      dispatch(fetchAllAdvertisements());
    } else {
      // Handle error response
      const errorData = result.payload || result.error;
      
      // Check if validation error
      if (errorData?.error?.message === "Validation failed" || 
          errorData?.message === "Validation failed") {
        
        // Show main validation error toast
        message.error("Validation failed! Please check all fields.");
        
        // If there are specific validation errors, show them
        if (errorData?.error?.errors) {
          const errors = errorData.error.errors;
          Object.keys(errors).forEach((field) => {
            message.error(`${field}: ${errors[field]}`);
          });
        } else if (errorData?.errors) {
          const errors = errorData.errors;
          Object.keys(errors).forEach((field) => {
            message.error(`${field}: ${errors[field]}`);
          });
        }
      } else {
        // Show general error message
        message.error(
          errorData?.message || errorData?.error?.message || "Failed to create advertisement"
        );
      }
    }
  };
  // const { currentAd, adLoading } = useSelector((state) => state.subAdmin);

  const openView = async (id) => {
    setViewOpen({ open: true }); // just open modal
    const result = await dispatch(fetchAdvertisementById(id));
    setViewOpen((prev) => ({ ...prev, ad: result.payload }));

    console.log("Thunk result:", result);
  };

  const columns = [
    {
      title: "Banner",
      dataIndex: "bannerImageUrl",
      render: (url) =>
        url ? (
          <Image
            src={url}
            width={100}
            height={60}
            style={{ objectFit: "cover" }}
            preview={false}
          />
        ) : (
          <Tag>No Image</Tag>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      render: (t) => <Text strong>{t || "—"}</Text>,
    },
    { title: "Location", dataIndex: "targetLocation" },
    {
      title: "Valid From",
      dataIndex: "validFrom",
      render: (d) => (d ? moment(d).format("DD MMM YYYY") : "—"),
    },
    {
      title: "Valid Until",
      dataIndex: "validUntil",
      render: (d) => (d ? moment(d).format("DD MMM YYYY") : "—"),
    },
    {
      title: "Actions",
      render: (_, rec) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openView(rec.id)}
          />
          <Popconfirm
            title="Delete?"
            onConfirm={() => dispatch(deleteAdvertisement(rec.id))}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space>
              <UserOutlined style={{ fontSize: 28, color: "#1890ff" }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  My Advertisements
                </Title>
                <Text type="secondary">Create and manage your ads</Text>
              </div>
            </Space>
            <Space>
              <Button onClick={() => dispatch(fetchAllAdvertisements())}>
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                onClick={openCreate}
              >
                Create Advertisement
              </Button>
            </Space>
          </div>
        }
        variant="outlined"
      >
        {advLoading ? (
          <Spin tip="Loading..." style={{ display: "block", marginTop: 50 }} />
        ) : myAds.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Title level={4}>No advertisements yet</Title>
            <Button type="primary" onClick={openCreate}>
              Create Your First Ad
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={myAds}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      {/* CREATE MODAL */}
      <Modal
        title="Create Advertisement"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Title"
                rules={[
                  { required: true, message: "Please enter title" },
                  {
                    pattern: /^[A-Za-z\s]+$/,
                    message: "Title can only contain letters",
                  },
                ]}
              >
                <Input placeholder="Enter advertisement title (text only)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="description" label="Description">
                <Input.TextArea
                  rows={3}
                  placeholder="Enter detailed description of advertisement"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="websiteUrl" label="Website URL">
                <Input placeholder="https://www.example.com" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="emailAddress"
                label="Email Address"
                rules={[
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="whatsappNumber"
                label="WhatsApp Number"
                rules={[
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "WhatsApp number must be exactly 10 digits",
                  },
                ]}
              >
                <Input
                  placeholder="9876543210 (10 digits only)"
                  maxLength={10}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={[
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                ]}
              >
                <Input
                  placeholder="9876543210 (10 digits only)"
                  maxLength={10}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="districtId" label="District ID">
                <Input placeholder="Enter district ID (e.g., 319)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="targetDistrictIds" label="Target District IDs">
                <Input placeholder="319, 320, 321 (comma separated)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="targetLocation" label="Target Location">
                <Input placeholder="Enter target location (e.g., Delhi, Mumbai)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="latitude" label="Latitude">
                <Input placeholder="28.7041 (decimal format)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="longitude" label="Longitude">
                <Input placeholder="77.1025 (decimal format)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="radiusKm" label="Radius (KM)">
                <Input placeholder="Enter radius in kilometers (e.g., 10)" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="additionalInfo" label="Additional Info">
                <Input placeholder="Any additional information about the advertisement" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="validFrom"
                label="Valid From"
                rules={[
                  { required: true, message: "Please select valid from date" },
                ]}
              >
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  placeholder="Select start date and time"
                  format="DD-MM-YYYY HH:mm"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="validUntil"
                label="Valid Until"
                dependencies={["validFrom"]}
                rules={[
                  { required: true, message: "Please select valid until date" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const validFrom = getFieldValue("validFrom");
                      if (!value || !validFrom) {
                        return Promise.resolve();
                      }
                      if (value.isBefore(validFrom)) {
                        return Promise.reject(
                          new Error("Valid Until must be after Valid From")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  placeholder="Select end date and time"
                  format="DD-MM-YYYY HH:mm"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Banner Image" required>
                <Upload
                  listType="picture-card"
                  fileList={bannerFileList}
                  beforeUpload={() => false}
                  onChange={({ fileList }) => setBannerFileList(fileList)}
                  maxCount={1}
                >
                  {bannerFileList.length === 0 && "Upload Banner"}
                </Upload>
                {bannerFileList.length === 0 && (
                  <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
                    Please upload banner image
                  </div>
                )}
              </Form.Item>
            </Col>

            {/* Video File */}
            {/* <Col span={12}>
                            <Form.Item label="Video File">
                                <Upload
                                    fileList={videoFileList}
                                    beforeUpload={() => false}
                                    onChange={({ fileList }) => setVideoFileList(fileList)}
                                    maxCount={1}
                                >
                                    Upload Video
                                </Upload>
                            </Form.Item>
                        </Col> */}
          </Row>

          <Divider />
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={advCreating}
              style={{ marginLeft: 8 }}
            >
              Create
            </Button>
          </div>
        </Form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        title="Advertisement Details"
        open={viewOpen.open}
        onCancel={() => setViewOpen({ open: false, ad: null })}
        footer={null}
        width={800}
      >
        {viewOpen.ad && (
          <>
            {viewOpen.ad.bannerImageUrl && (
              <Image
                src={viewOpen.ad.bannerImageUrl}
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Title:</Text> {viewOpen.ad.title}
              </Col>
              <Col span={12}>
                <Text strong>Location:</Text> {viewOpen.ad.targetLocation}
              </Col>
              <Col span={12}>
                <Text strong>WhatsApp:</Text> {viewOpen.ad.whatsappNumber}
              </Col>
              <Col span={12}>
                <Text strong>Phone:</Text> {viewOpen.ad.phoneNumber}
              </Col>
              <Col span={24}>
                <Text strong>Description:</Text>
                <br />
                {viewOpen.ad.description}
              </Col>
              <Col span={12}>
                <Text strong>Valid From:</Text>
                <br />
                {moment(viewOpen.ad.validFrom).format("DD MMM YYYY, hh:mm A")}
              </Col>
              <Col span={12}>
                <Text strong>Valid Until:</Text>
                <br />
                {moment(viewOpen.ad.validUntil).format("DD MMM YYYY, hh:mm A")}
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdvertisementManagement;