import React, { use, useEffect, useState } from "react";
import { Layout, Menu, Typography, Button } from "antd";
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
import fetchSubAdmins from "../../redux/slices/subAdminSlice";
import axios from "axios";
import { BASE_URL } from "../../utils/axiosInstance";

const { Header, Content } = Layout;
const { Title } = Typography;

// { key: "advertisements", label: "Advertisement List", icon: <FileTextOutlined />, path: "/advertisements", component: FranchiseList },


const pages = [
  {
    key: "advertisements",
    label: "Advertisement List",
    icon: <UserOutlined />,
    path: "/subadmins",
    component: <AdvertisementManagement />,
    permissionKey: "ADVERTISEMENT"
  },
  {
    key: "franchise",
    label: "Franchise",
    icon: <BankOutlined />,
    path: "/franchise",
    component: <FranchiseList />,
    permissionKey: "FRANCHISEE"
  },
  {
    key: "property",
    label: "Property",
    icon: <HomeOutlined />,
    path: "/property",
    component: <PropertyListss />,
    permissionKey: "PROPERTY"
  }
];


const SubAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dataaa, setData] = useState([]);

  const handleMenuClick = ({ key }) => {
    const page = pages.find((p) => p.key === key);
    if (page) navigate(page.path);
  };




  const getdata = () => {

    const subAdminId = Number(localStorage.getItem("userId"));

    axios.get(
      "https://api.nearprop.com/api/admin/permissions/subadmins",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("subAdminToken")}`
        }
      }
    )
      .then(response => {
        const { success, data } = response.data;

        if (!success) {
          toast.error("Internal server error. Please try again later.");
          return;
        }

        data.forEach(item => {
          if (item.id == subAdminId) {
            console.log("fjffjfj", item.permissions);

            setData(item.permissions);
          }
        });

        console.log("Fetched sub-admin data:", dataaa);
      })
      .catch(error => {
        console.error("There was an error!", error);
        toast.error("Something went wrong while fetching data.");
      });
  };



  useEffect(() => {
    getdata();

  }, []);

  const allowedPages = pages.filter(
    (page) => dataaa && dataaa[page.permissionKey] && dataaa[page.permissionKey].length > 0
  );

  const hasPermission = allowedPages.length > 0;


  useEffect(() => {
    if (allowedPages.length > 0) {
      // Check if user has permission for "advertisements"
      const hasAdvertisementsPermission = allowedPages.some(
        (p) => p.permissionKey === "Advertisement"
      );

      // If they don't have it, redirect to first allowed page ONLY if not already there
      const targetPath = allowedPages[0].path;
      if (!hasAdvertisementsPermission && location.pathname !== targetPath) {
        navigate(targetPath, { replace: true });
      }
    }
  }, [allowedPages, location.pathname, navigate]);


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
            selectedKeys={[currentPage?.key]}
            onClick={handleMenuClick}
            items={allowedPages.map((p) => ({
              key: p.key,
              label: p.label,
              icon: p.icon,
            }))}
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
        {hasPermission ? (
          currentPage?.component
        ) : (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <Title level={4}>No Permission Yet</Title>
            <p>Please contact admin to assign permissions.</p>
          </div>
        )}
      </Content>


    </Layout>
  );
};

export default SubAdminLayout;
