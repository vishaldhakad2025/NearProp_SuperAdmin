import React from "react";
import { Layout, Menu, Typography ,Button} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  LogoutOutlined,
  BankOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdvertisementManagement from "./SubAdmin";
import FranchiseList from "./Franchise";
import PropertyList from "./Property";
import PropertyListss from "./Property";
import { toast } from "react-toastify";
// import SubAdminList from "./SubAdminList";
// import AdvertisementList from "./AdvertisementList";
// import FranchiseList from "./FranchiseList";
// import PropertyList from "./PropertyList";

const { Header, Content } = Layout;
const { Title } = Typography;

const pages = [
  { key: "subadmins", label: "SubAdmin List", icon: <UserOutlined />, path: "/subadmin", component: <AdvertisementManagement /> },
  // { key: "advertisements", label: "Advertisement List", icon: <FileTextOutlined />, path: "/advertisements", component: FranchiseList },
  { key: "franchise", label: "Franchise", icon: <BankOutlined />, path: "/franchise", component: <FranchiseList /> },
  { key: "property", label: "Property", icon: <HomeOutlined />, path: "/property", component: <PropertyListss /> },
];

const SubAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    const page = pages.find((p) => p.key === key);
    if (page) navigate(page.path);
  };

const handleLogout = () => {
  console.log("dvhdfbhdfghg");
  
  localStorage.removeItem("subAdminToken");
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("jwt");

  toast.success("Logged out successfully");
  navigate("/sub-admin", { replace: true });
};
  // Determine current selected page
  const currentPage = pages.find((p) => p.path === location.pathname) || pages[0];
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Top Navigation */}

       <Header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
  <Title level={3} style={{ color: "#fff", margin: 0 }}>
    SubAdmin Panel
  </Title>

  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
    {/* Menu */}
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[currentPage.key]}
      onClick={handleMenuClick}
      items={pages.map((p) => ({ key: p.key, label: p.label, icon: p.icon }))}
      style={{ background: "transparent", border: "none" }}
    />

    {/* छोटा और सुंदर Logout Button */}
    <Button
      type="text"
      danger
      size="middle"
      icon={<LogoutOutlined style={{ fontSize: 18 }} />}
      onClick={handleLogout}
      style={{
        color: "#ff4d4f",
        fontWeight: 600,
        borderRadius: 8,
        padding: "0 16px",
        height: 38,
      }}
    >
      Logout
    </Button>
  </div>
</Header>
    

      {/* Content Area */}
      <Content style={{ margin: 24, background: "#fff", padding: 24 }}>
        {currentPage.component}
        {/* Or you can use <Outlet /> if using nested routing */}
      </Content>
    </Layout>
  );
};

export default SubAdminLayout;
