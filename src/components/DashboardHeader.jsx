// src/components/DashboardHeader.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaBars, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import logo from "../assets/logo.png"
const DashboardHeader = ({ onMenuClick, isSidebarOpen }) => {
  const headerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const user = useSelector((state) => state.auth?.user) || JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!headerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-40 bg-white shadow-md transition-all duration-300 ${isSidebarOpen ? "pl-72" : "pl-4"
        }`}
    >
      <div className="flex justify-between items-center px-5 py-3">

        {/* Left: Menu Toggle + Title */}
        <div className="flex items-baseline justify-start gap-4">

          {!isSidebarOpen && (
            <FaBars
              className="text-gray-600 text-xl cursor-pointer hover:scale-110 transition-transform"
              onClick={onMenuClick}
            />
          )}
          <h1 className="text-lg md:text-xl  hidden md:flex items-end font-semibold text-blue-800"> {user?.name || "NearProp Admin Panel"} </h1>
        </div>

        {/* Right: User Profile */}
        <div className="relative flex  gap-3">

          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="cursor-pointer w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold uppercase shadow-sm"
          >
            {user?.name?.charAt(0) || <FaUser />}
          </div>
          <div>
            {!isSidebarOpen && <img title="NearProp " src={logo} alt="" className="w-10 " />}
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 mt-12 w-52 bg-white border border-gray-100 rounded-md shadow-lg z-50">
              <div className="px-4 py-3 border-b text-sm font-semibold text-gray-700">
                {user?.name || "Admin"}
              </div>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                onClick={() => navigate("/dashboard/profile")}
              >
                <FaUser /> Profile
              </button>
              {/* <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                onClick={() => navigate("/dashboard/settings")}
              >
                <FaCog /> Settings
              </button> */}
              <hr />
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 text-sm"
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
