import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Users, Settings, LogOut, MapPin, Landmark,
  MessageSquare, Film, Eye, Hotel, PercentCircle, Megaphone, Layers,
  User,
  EyeIcon,
  InfoIcon,
  User2,
  ActivityIcon,
  Video,
  Type,
  UserCheck2Icon
} from "lucide-react";
import logo from "../assets/logo.png"
import { FaHotel, FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { AnimatePresence, motion } from "framer-motion";
import { HomeOutlined } from "@ant-design/icons";
import { MdDashboardCustomize, MdOutlineRoom, MdRoom, MdRoomService } from "react-icons/md";
import { BsCameraReels } from "react-icons/bs";

const DashboardSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeItem, setActiveItem] = useState(null);

  const handleItemClick = (label, url, isLogout = false) => {
    if (isLogout) {
      dispatch(logout());
      navigate("/login");
    } else if (url) {
      navigate(url);
    }
    if (onClose) onClose();
  };

  const menuSections = [
    {
      section: null,
      items: [
        { icon: <Home size={18} />, label: "Dashboard", url: "/dashboard" },
      ],
    },
    {
      section: "User & Property ",
      items: [
        //  { icon: <Users size={18} />, label: "user Management", url: "/dashboard/user-request" },
        { icon: <Users size={18} />, label: "users", url: "/dashboard/users" },
        {
          icon: <Layers size={18} />,
          label: "Property Management",
          submenu: true,
          children: [
            { label: "All Properties", url: "/dashboard/properties" },
            { label: "Properties Search ", url: "/dashboard/propertysearch" },
            { label: "Properties Update Requests", url: "/dashboard/properties/seller-updates" },

            { icon: <ActivityIcon size={18} />, label: " Visit Tracking", url: "/dashboard/visits" },

            { label: "Pending Properties", url: "/dashboard/properties/pending" },
            // { label: "Districts", url: "/dashboard/properties/districts" },
          ],
        },
        { icon: <Type size={18} />, label: "Property Types", url: "/dashboard/properties/types" },
        // { icon: <InfoIcon size={18} />, label: "InquiryVisit Properties", url: "/dashboard/inquiry" },
        { icon: <InfoIcon size={18} />, label: " Visit Tracking", url: "/dashboard/visits" },

        // { icon: <MapPin size={18} />, label: "District Management", url: "/dashboard/districts" },
      ],
    },
    {
      section: "Franchisee Management",
      items: [
        // { icon: <User size={18} />, label: "Franchise request", url: "/dashboard/franchisee/" },

        { icon: <Landmark size={18} />, label: "Franchisee Management", url: "/dashboard/franchisee" },
        // { icon: <User size={18} />, label: "Franchise request", url: "/dashboard/franchisee/" },
        { icon: <Users size={18} />, label: "Franchisee Withdrawal", url: "/dashboard/franchisee/withdrawal" },
      ],
    },
    {
      section: "Reels Management",
      items: [
        { icon: <Video size={18} />, label: "Reels Management", url: "/dashboard/reels" },
      ],
    },
    
    {
      section: "Sub-Admin Management",
      items: [
        { icon: <UserCheck2Icon size={18} />, label: "Sub-Admins", url: "/dashboard/sub-admins" },
      ],
    },
      {
      section: "Business Tools",
      items: [
        { icon: <PercentCircle size={18} />, label: "Subscription Plans", url: "/dashboard/subscriptions" },
        {
          icon: <Megaphone size={18} />,
          label: "Advertisement Management",
          url: "/dashboard/advertisements"
        },
        { icon: <PercentCircle size={18} />, label: "Coupon Management", url: "/dashboard/coupons" },
        // { icon: <Film size={18} />, label: "Reels Management", url: "/dashboard/reels" },
        { icon: <MessageSquare size={18} />, label: "Chat Management", url: "/dashboard/chats" },
        // { icon: <Eye size={18} />, label: "User Visit Tracking", url: "/dashboard/visits" },

        // { icon: <Hotel size={18} />, label: "Hotel Management", url: "/dashboard/hotels" },
      ],
    },
    {
      section: "Hotel & Banquet ",
      items: [

        { icon: <PercentCircle size={18} />, label: "Subscription Hotel&banqute", url: "/dashboard/plan" },
        { icon: <User2 size={18} />, label: "Hotel&Banqute Owners", url: "/dashboard/owners" },
        { icon: <HomeOutlined size={18} />, label: "All Hotels", url: "/dashboard/all-hotels" },
        { icon: <FaHotel size={18} />, label: "All Banquets", url: "/dashboard/all-banquets" },
        // { icon: <MdOutlineRoom size={18} />, label: "Hotel Rooms", url: "/dashboard/hotel-rooms" },
        // { icon: <BsCameraReels size={18} />, label: "Hotel & Banquet Reels", url: "/dashboard/hotel-banquet-reels" },
        // { icon: <MdDashboardCustomize size={18} />, label: "Hotel & Banquet Dashboard", url: "/dashboard/hotel-banquet-dashboard" },
      ],
    },
    {
      section: "Pg & Hostal Management",
      items: [
        { icon: <Layers size={18} />, label: "Landlords", url: "/dashboard/landlords" },
        // { icon: <Layers size={18} />, label: "Pg & Hostel", url: "/dashboard/pg-hostel" },

      ],
    },
  
    {
      section: "Settings",
      items: [
        // { icon: <Settings size={18} />, label: "dashboard Settings", url: "/dashboard/settings" },
      ],
    },
    {
      section: " ",
      items: [
        { icon: <LogOut size={18} />, label: "Logout", url: "/login", logout: true },
      ],
    },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 bg-gray-50 shadow-inner transform ${isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
    >
      {/* Header */}
      <div className="p-4 border-b sticky top-0 z-50 flex items-center justify-between">
        <div className="flex justify-between gap-2 items-end">
          {isOpen && <img title="NearProp " src={logo} alt="" className="w-12 " />}
          <h2 className="text-xl font-bold text-blue-600">NearProp </h2>
        </div>
        <button onClick={onClose}>
          <FaTimes className="text-blue-600 text-lg hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      {/* Menu */}
      <div className="px-4 py-4 overflow-y-auto h-[calc(100vh-64px)] text-sm space-y-4">
        {menuSections.map(({ section, items }, idx) => (
          <div key={section || `section-${idx}`}>
            {section && (
              <p className="text-gray-400 uppercase text-xs font-semibold mb-1 border-b pb-1 border-dashed border-gray-200">
                {section}
              </p>
            )}

            {items.map((item) => (
              <div key={item.label}>
                <div
                  onClick={() =>
                    item.submenu
                      ? setActiveItem((prev) => (prev === item.label ? null : item.label))
                      : handleItemClick(item.label, item.url, item.logout)
                  }
                  className={`flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded-md transition-all duration-300 ${activeItem === item.label
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-800"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.submenu && (
                    <span className="text-sm">
                      {activeItem === item.label ? "▲" : "▼"}
                    </span>
                  )}
                </div>

                {/* Animate submenu */}
                <AnimatePresence initial={false}>
                  {item.submenu && activeItem === item.label && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-6 overflow-hidden"
                    >
                      <div className="space-y-1 mt-1">
                        {item.children?.map((child) => (
                          <div
                            key={child.label}
                            onClick={() => handleItemClick(child.label, child.url)}
                            className="cursor-pointer text-gray-700 hover:text-blue-600 text-sm px-2 py-1 rounded hover:bg-blue-50"
                          >
                            {child.label}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSidebar;
