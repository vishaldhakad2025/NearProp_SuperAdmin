import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Card,
    Avatar,
    Descriptions,
    Spin,
    Alert,
    Button,
    Row,
    Col,
    Statistic,
    Typography,
    Space,
    Tag,
    Divider,
} from "antd";
import {
    UserOutlined,
    ArrowLeftOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    ManOutlined,
    WomanOutlined,
    HomeOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const Getlandlordbyid = () => {
    const { id } = useParams();
    console.log(id)
    const navigate = useNavigate();
    const [landlord, setLandlord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const baseUrl = "https://pg-hostel.nearprop.com";

    useEffect(() => {
        const fetchLandlord = async () => {
            setLoading(true);
            setError("");
            try {
                console.log("Fetching landlord with ID:", id);
                const res = await axios.get(
                    `${baseUrl}/api/admin/landlords/${id}`
                );
                console.log("Landlord Data:", res.data);
                setLandlord(res.data.landlord);
            } catch (err) {
                console.error("Error fetching landlord:", err);
                setError(
                    err.response?.data?.message || "Failed to fetch landlord details"
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchLandlord();
        }
    }, [id]);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
                <Spin size="large" tip="Loading landlord details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button onClick={() => navigate("/dashboard/landlords")}>
                            Back to Landlords
                        </Button>
                    }
                />
            </div>
        );
    }

    if (!landlord) {
        return (
            <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
                <Alert
                    message="No Data"
                    description="Landlord not found"
                    type="warning"
                    showIcon
                    action={
                        <Button onClick={() => navigate("/dashboard/landlords")}>
                            Back to Landlords
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
            {/* Header */}
            <Space style={{ marginBottom: "20px" }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/dashboard/landlords")}
                >
                    Back
                </Button>
            </Space>

            <Card>
                {/* Profile Section */}
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                        <Avatar
                            size={120}
                            icon={<UserOutlined />}
                            src={
                                landlord.profilePhoto
                                    ? `${baseUrl}${landlord.profilePhoto}`
                                    : null
                            }
                            style={{ marginBottom: "16px" }}
                        />
                        <Title level={3} style={{ marginBottom: "8px" }}>
                            {landlord.name}
                        </Title>
                        <Tag
                            icon={
                                landlord.gender === "Male" ? (
                                    <ManOutlined />
                                ) : (
                                    <WomanOutlined />
                                )
                            }
                            color={landlord.gender === "Male" ? "blue" : "pink"}
                        >
                            {landlord.gender}
                        </Tag>
                    </Col>

                    <Col xs={24} sm={16}>
                        <Title level={4}>Personal Information</Title>
                        <Descriptions column={1} bordered>
                            <Descriptions.Item
                                label={
                                    <span>
                                        <MailOutlined /> Email
                                    </span>
                                }
                            >
                                {landlord.email}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <span>
                                        <PhoneOutlined /> Mobile
                                    </span>
                                }
                            >
                                {landlord.mobile}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <span>
                                        <EnvironmentOutlined /> Address
                                    </span>
                                }
                            >
                                {landlord.address}, {landlord.state} - {landlord.pinCode}
                            </Descriptions.Item>
                            <Descriptions.Item label="Joined Date">
                                {dayjs(landlord.createdAt).format("MMMM DD, YYYY")}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>

                <Divider />

                {/* Statistics */}
                <Title level={4}>Statistics</Title>
                <Row gutter={16}>
                    <Col xs={12} sm={8}>
                        <Card>
                            <Statistic
                                title="Properties"
                                value={landlord.stats?.propertyCount || 0}
                                prefix={<HomeOutlined />}
                                valueStyle={{ color: "#3f8600" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                        <Card>
                            <Statistic
                                title="Reels"
                                value={landlord.stats?.reelsCount || 0}
                                prefix={<VideoCameraOutlined />}
                                valueStyle={{ color: "#cf1322" }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Properties Section */}
                {landlord.properties && landlord.properties.length > 0 && (
                    <>
                        <Divider />
                        <Title level={4}>Properties</Title>
                        <Row gutter={[16, 16]}>
                            {landlord.properties.map((property, index) => (
                                <Col xs={24} sm={12} md={8} key={index}>
                                    <Card
                                        hoverable
                                        onClick={() =>
                                            navigate(`/properties/${property.id}`)
                                        }
                                    >
                                        <Card.Meta
                                            title={property.name || "Property"}
                                            description={property.address || "No address"}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}

                {landlord.properties && landlord.properties.length === 0 && (
                    <>
                        <Divider />
                        <Alert
                            message="No Properties"
                            description="This landlord hasn't added any properties yet."
                            type="info"
                            showIcon
                        />
                    </>
                )}
            </Card>
        </div>
    );
};

export default Getlandlordbyid;