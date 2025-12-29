import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    Spin,
    Avatar,
    Tag,
    Empty,
    Card,
    Typography,
    Row,
    Col,
    Input,
    Button,
    Space,
} from "antd";
import { UserOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import LandlordStats from "./LandlordStats";

const { Title } = Typography;
const { Search } = Input;

const Alllandlords = () => {
    const navigate = useNavigate();
    const [allLandlords, setAllLandlords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const baseUrl = "https://pg-hostel.nearprop.com";

    // Fetch all landlords
    const fetchLandlords = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${baseUrl}/api/admin/landlords?limit=1000`
            );
            console.log("Landlords List:", data);
            setAllLandlords(data.landlords || []);
        } catch (error) {
            console.error("Error fetching landlords:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLandlords();
    }, []);

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    // View landlord details
    const handleViewDetails = (landlordId) => {
        navigate(`/dashboard/landlords/${landlordId}`);
    };

    // Filter landlords based on search
    const filteredLandlords = allLandlords.filter(
        (landlord) =>
            landlord.name.toLowerCase().includes(search.toLowerCase()) ||
            landlord.email.toLowerCase().includes(search.toLowerCase()) ||
            landlord.mobile.includes(search)
    );

    // Paginate filtered data
    const total = filteredLandlords.length;
    const paginatedLandlords = filteredLandlords.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handlePaginationChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const columns = [
        {
            title: "Profile",
            key: "profile",
            width: 80,
            render: (_, record) => (
                <Avatar
                    size={40}
                    icon={<UserOutlined />}
                    src={
                        record.profilePhoto
                            ? `${baseUrl}${record.profilePhoto}`
                            : null
                    }
                />
            ),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Mobile",
            dataIndex: "mobile",
            key: "mobile",
        },
        {
            title: "Properties",
            dataIndex: "propertyCount",
            key: "propertyCount",
            render: (count) => (
                <Tag color={count > 0 ? "green" : "default"}>
                    {count} {count === 1 ? "Property" : "Properties"}
                </Tag>
            ),
        },
        {
            title: "Joined",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format("MMM DD, YYYY"),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record.id)}
                    >
                        View
                    </Button>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <div>
                <LandlordStats />
            </div>
            <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>
                            Landlords ({filteredLandlords.length})
                        </Title>
                    </Col>
                </Row>

                <Card>
                    <Search
                        placeholder="Search landlords by name, email, or mobile"
                        allowClear
                        enterButton
                        onSearch={handleSearch}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ marginBottom: "20px" }}
                    />

                    {filteredLandlords.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={paginatedLandlords}
                            rowKey="id"
                            pagination={{
                                current: currentPage,
                                pageSize,
                                total,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                onChange: handlePaginationChange,
                                onShowSizeChange: (current, size) => {
                                    setPageSize(size);
                                    setCurrentPage(1);
                                },
                            }}
                            size="middle"
                            scroll={{ x: 800 }}
                        />
                    ) : (
                        <Empty description="No landlords found" />
                    )}
                </Card>
            </div>
        </>

    );
};

export default Alllandlords;