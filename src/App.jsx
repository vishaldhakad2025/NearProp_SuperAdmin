



// import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import Login from "./pages/auth/Login";
import Index from "./pages/dashboard/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
//  import AdminRequestPage from "./pages/Users/AdminRequestPage";
 import { Routes, Route, Navigate } from "react-router-dom";
//  import PrivateRoute from "./utils/PrivateRoute";
//  import Login from "./pages/auth/Login";
//  import Index from "./pages/dashboard/Dashboard";
//  import AdminLayout from "./layouts/AdminLayout";
//  import OtpVerify from "./pages/auth/OtpVerify";
 import AllProperties from "./pages/Properties/AllProperties";
 import PropertyDetails from "./pages/Properties/PropertyDetails";
 import PendingPropertiesPage from "./pages/Properties/PendingPropertiesPage";
 import PropertyTypeStats from "./pages/Properties/PropertyTypeStats";
 import UpdateRequestsProp from "./pages/Properties/UpdateRequestsProp";
 import NotFound from "./utils/NotFound";
 import SubscriptionPlansListPage from "./pages/subscription/SubscriptionPlansListPage";
 import SubscriptionPlanForm from "./pages/subscription/SubscriptionPlanForm";
 import CouponListPage from "./pages/coupon/CouponListPage";
 import CouponForm from "./pages/coupon/CouponForm";
 import AdminRequestPage from "./pages/Users/AdminRequestPage";
 import AdminAdvertisementPage from "./pages/adv/AdminAdvertisementPage";
 import AdvertisementViewPage from "./pages/adv/AdvertisementViewPage";
 import ProfilePage from "./pages/auth/ProfilePage";
 import ChatPanel from "./pages/chat/ChatPanel";
 import InquiryManagement from "./pages/inquiry/InquiryManagement";
 import FranchiseeManagement from "./pages/franchisee/FranchiseeManagement";
 import FranchiseeDashboard from "./pages/franchisee/FranchiseeDashboard";
 import FranchiseeWithdrawal from "./pages/franchisee/FranchiseeWithdrawal";
 import UserManagementDashboard from "./pages/Users/UserManagementDashboard";
 import AllHotels from "./pages/Hotel&Banqute/AllHotels";
 import AllBanquets from "./pages/Hotel&Banqute/AllBanquets";
 import HotelDetails from "./pages/Hotel&Banqute/HotelDetails";
//  import { LandlordDashboardPage } from "./pages/pgHostal/Dashboardlandloard";
 import { LandlordsListPage } from "./pages/pgHostal/LandlordsListPage";
 import { LandlordDetailsPage } from "./pages/pgHostal/LandlordDetailPage";
 import RoomDetails from "./pages/Hotel&Banqute/RoomDetails";
 import BanquetDetails from "./pages/Hotel&Banqute/BanquetDetails";
 import OwnerList from "./pages/Hotel&Banqute/OwnerList";
 import OwnerDetail from "./pages/Hotel&Banqute/OwnerDetail";
 import HotelPlansPage from "./pages/Hotel&Banqute/HotelPlansPage";
 import VisitManagement from "./pages/inquiry/VisitManagement";
 import ReelManagement from "./pages/reels/ReelManagement";
 import PropertySearch from "./pages/Properties/PropertySearch";
 import { PropertyList } from "./pages/pgHostal/PropertyList";
//  import SubAdminManagement from "./pages/sub-admin/SubAdminManagement";
 // import LandlordDashboard from "./pages/pgHosdastal/Dashboardlandloard";
import OtpVerify from "./pages/auth/OtpVerify";
// ... बाकी imports

import SubAdminManagement from "./pages/sub-admin/SubAdminManagement";
import SubAdmin from "./pages/sub-admin/SubAdmin";  // यह SubAdmin का अपना dashboard/page है
import SubAdminDashboard from "./pages/sub-admin/subAdminMenu";
import SubAdminLayout from "./pages/sub-admin/subAdminMenu";
import FranchiseList from "./pages/sub-admin/Franchise";
import PropertyListss from "./pages/sub-admin/Property";
import SubAdminLogin from "./pages/auth/SubAdmin";
import SubOtpVerify from "./pages/auth/SubAdminOtpVerify";

const App = () => {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<SubAdminLogin />} />
      {/* <Route path="/" element={<Login />} /> */}
      <Route path="/verify-otp" element={<OtpVerify />} />
      <Route path="/sub-admin" element={<SubAdminLogin />} />
      <Route path="/sub-verify-otp" element={<SubOtpVerify />} />


      {/* SubAdmin का अलग रूट — बिल्कुल बाहर, dashboard से अलग */}
      <Route 
        path="/subadmins" 
        element={
          <PrivateRoute roles={['SUBADMIN']}>
            <SubAdminLayout />
          </PrivateRoute>
        } 
      />

       <Route 
        path="/franchise" 
        element={
          <PrivateRoute roles={['SUBADMIN']}>
            <FranchiseList />
          </PrivateRoute>
        } 
      />

       <Route 
        path="/property" 
        element={
          <PrivateRoute roles={['SUBADMIN']}>
            <PropertyListss />
          </PrivateRoute>
        } 
      />

      {/* Admin Dashboard — सब कुछ इसके अंदर */}
      <Route path="/dashboard" element={<AdminLayout />}>
        <Route index element={<Index />} />
        
        <Route path="user-request" element={<AdminRequestPage />} />
        <Route path="users" element={<UserManagementDashboard />} />
        <Route path="profile" element={<ProfilePage />} />

        <Route path="properties" element={<AllProperties />} />
        <Route path="properties/:id" element={<PropertyDetails />} />
        <Route path="propertysearch" element={<PropertySearch />} />
        <Route path="properties/pending" element={<PendingPropertiesPage />} />
        <Route path="properties/types" element={<PropertyTypeStats />} />
        <Route path="properties/seller-updates" element={<UpdateRequestsProp />} />

        <Route path="subscriptions" element={<SubscriptionPlansListPage />} />
        <Route path="subscriptions/create" element={<SubscriptionPlanForm />} />
        <Route path="subscription/edit/:id" element={<SubscriptionPlanForm />} />

        <Route path="coupons" element={<CouponListPage />} />
        <Route path="coupons/create" element={<CouponForm />} />
        <Route path="coupons/edit/:id" element={<CouponForm />} />

        <Route path="advertisements" element={<AdminAdvertisementPage />} />
        <Route path="advertisements/:id" element={<AdvertisementViewPage />} />

        <Route path="chats" element={<ChatPanel />} />
        <Route path="reels" element={<ReelManagement />} />

        {/* यह सिर्फ ADMIN देखेगा — SubAdmin Management */}
        <Route 
          path="sub-admins" 
          element={
            <PrivateRoute roles={['ADMIN']}>
              <SubAdminManagement />
            </PrivateRoute>
          } 
        />

        <Route path="inquiry" element={<InquiryManagement />} />
        <Route path="visits" element={<VisitManagement />} />
        <Route path="franchisee" element={<FranchiseeManagement />} />
        <Route path="franchisee/withdrawal" element={<FranchiseeWithdrawal />} />

        {/* Hotel & Banquet Routes */}
        <Route path="plan" element={<HotelPlansPage />} />
        <Route path="owners" element={<OwnerList />} />
        <Route path="owners/:id" element={<OwnerDetail />} />
        <Route path="all-hotels" element={<AllHotels />} />
        <Route path="all-banquets" element={<AllBanquets />} />
        <Route path="all-hotels/:hotelId" element={<HotelDetails />} />
        <Route path="all-banquets/:banquetId" element={<BanquetDetails />} />
        <Route path="rooms/:roomId" element={<RoomDetails />} />

        {/* Landlord Routes */}
        <Route path="landlords" element={<LandlordsListPage />} />
        <Route path="landlords/:id" element={<LandlordDetailsPage />} />
        <Route path="pg-hostel" element={<PropertyList />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 404 - बाहर का 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;