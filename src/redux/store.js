import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import propertyUpdateReducer from './slices/propertyUpdateSlice';
import subscriptionPlansReducer from './slices/subscriptionPlanSlice';
import couponReducer from './slices/couponSlice';
import districtReducer from './slices/districtSlice';
import roleRequestReducer from './slices/roleRequestSlice';
import advertisementReducer from './slices/advertisementSlice';
import chatReducer from './slices/chatSlice';
import dashboardReducer from './slices/dashboardSlice';
import inquiryReducer from './slices/inquirySlice';
import visitsReducer from './slices/visitsSlice';
import franchiseeReducer from './slices/franchiseeSlice';
import franchiseeWithdrawalReducer from './slices/franchiseeWithdrawalSlice';
import userManagementReducer from './slices/userManagementSlice';
import hotelBanquetReducer from './slices/hotelBanquetSlice';
import landlordReducer from './slices/landlordSlice';
import hotelReducer from './slices/hotelsPlansSlice';
import reelReducer from './slices/reelsSlice';
import subAdminReducer from './slices/subAdminSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    propertyUpdates: propertyUpdateReducer,
    subscriptionPlans: subscriptionPlansReducer,
    coupons: couponReducer,
    districts: districtReducer,
    roleRequests: roleRequestReducer,
    advertisements: advertisementReducer,
    chat: chatReducer,
    dashboard: dashboardReducer,
    inquiry: inquiryReducer,
    visits: visitsReducer,
    franchisee: franchiseeReducer,
    franchiseeWithdrawal: franchiseeWithdrawalReducer,
    userManagement: userManagementReducer,
    hotelBanquet: hotelBanquetReducer,
    landlords: landlordReducer,
    hotelplans: hotelReducer,
    reels: reelReducer,
    subAdmin: subAdminReducer,
  },
});
