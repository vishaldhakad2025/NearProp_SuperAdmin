import React from "react";
import DashboardIndex from "./DashboardIndex";
import Dashboarchart from "./Dashboarchart";

{/* Card Component */ }
const DashboardCard = ({ title, value, icon, gradient }) => (
  <div
    className={`bg-gradient-to-r ${gradient} rounded-xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-transform duration-300 text-white`}
  >
    <div className="flex items-center justify-between">
      <span className="text-4xl">{icon}</span>
      <div className="text-right">
        <p className="text-sm font-medium opacity-80">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </div>
  </div>
);
const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6"></h1>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Total Users"
          value="1,245"
          icon="👤"
          gradient="from-indigo-400 to-indigo-500"
        />
        <DashboardCard
          title="Total Appointments"
          value="325"
          icon="📅"
          gradient="from-green-400 to-green-500"
        />
        <DashboardCard
          title="Revenue"
          value="₹75,000"
          icon="💰"
          gradient="from-yellow-400 to-yellow-500"
        />
      </div> */}

      {/* Stats and Charts */}
      <div className="grid grid-cols-1 gap-6 mb-8">
       
          <DashboardIndex />
      

      </div>
      <div className=" shadow-lg rounded-lg p-6">
        {/* <Dashboarchart /> */}
      </div>
      {/* Chat Panel
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Chat with Buyers</h2>
         <ChatPanel /> 
      </div> */}

      {/* Recent Activity */}
      {/* <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <ul className="space-y-4">
          <li className="flex justify-between items-center text-gray-700 hover:bg-gray-50 p-2 rounded transition-colors duration-200">
            <span>Booking by Rohit Patel</span>
            <span className="text-sm text-gray-500">2 hrs ago</span>
          </li>
          <li className="flex justify-between items-center text-gray-700 hover:bg-gray-50 p-2 rounded transition-colors duration-200">
            <span>New Salon Registered: Glam Zone</span>
            <span className="text-sm text-gray-500">Today</span>
          </li>
          <li className="flex justify-between items-center text-gray-700 hover:bg-gray-50 p-2 rounded transition-colors duration-200">
            <span>Revenue updated: ₹2,500</span>
            <span className="text-sm text-gray-500">Yesterday</span>
          </li>
        </ul>
      </div> */}
    </div>
  );
};

export default Index;