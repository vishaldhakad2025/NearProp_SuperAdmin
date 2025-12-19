// utils/axiosInstance.js
import axios from "axios";

export const BASE_URL = "https://api.nearprop.com";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Interceptor - Token Handling
axiosInstance.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("token");
    const subAdminToken = localStorage.getItem("subAdminToken");
    console.log("SubAdmin Token in Request Interceptor:", subAdminToken);

    // Admin Permission Management APIs
    if (config.url.startsWith("/api/admin/permissions")) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }

    // Sub-Admin Self Manage APIs
    else if (config.url.startsWith("/api/admin/subadmin")) {
      if (subAdminToken) {
        config.headers.Authorization = `Bearer ${subAdminToken}`;
      }
    }

    // Default fallback
    else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor - Separate Logout
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status;

//     if (status === 401 || status === 403) {
//       if (error.response.config.url.includes("/api/admin/subadmin")) {
//         localStorage.removeItem("subAdminToken");
//         window.location.href = "/login-subadmin";
//       } else {
//         localStorage.removeItem("adminToken");
//         window.location.href = "/";
//       }
//     }
//     return Promise.reject(error);
//   }
// );


// FIXED Response Interceptor - No force logout for Admin session
// Response Interceptor – No Auto Logout on 403/404
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // ❌ Do NOT clear tokens on 403/404
    if (status === 401) {
      const url = error.response?.config?.url;

      // Sub-admin unauthorized
      if (url.includes("/api/admin/subadmin") || url.includes("/permissions/subadmins")) {
        console.warn("SubAdmin unauthorized request!");
      }
      // Admin unauthorized
      else {
        console.warn("Admin unauthorized request!");
      }
    }

    // Just show error — no redirect
    return Promise.reject(error);
  }
);



export default axiosInstance;
