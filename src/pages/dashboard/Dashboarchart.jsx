import React, { useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import gsap from "gsap";
import { FaHome, FaUser, FaRegComments, FaCalendarCheck } from "react-icons/fa";

const Dashboarchart = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(sectionRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
  }, []);

  const revenueData = [
    { month: "Jan", revenue: 120000 },
    { month: "Feb", revenue: 140000 },
    { month: "Mar", revenue: 180000 },
    { month: "Apr", revenue: 170000 },
    { month: "May", revenue: 220000 },
    { month: "Jun", revenue: 260000 },
  ];

  const recentProperties = [
    { id: 1, name: "Lake View Apartment", city: "Ujjain", price: "₹18,000", status: "Available" },
    { id: 2, name: "Downtown Office", city: "Indore", price: "₹45,000", status: "Booked" },
    { id: 3, name: "Beach Villa", city: "Goa", price: "₹75,000", status: "Available" },
  ];

  const bookings = [
    { id: 101, customer: "Ramesh", property: "Lake View Apartment", date: "25 June" },
    { id: 102, customer: "Sita", property: "Goa Villa", date: "24 June" },
  ];

  const chats = [
    { id: 1, user: "Ravi Kumar", lastMessage: "Is the villa still available?" },
    { id: 2, user: "Priya Mehta", lastMessage: "Send location details please." },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6" ref={sectionRef}>
     

      {/* Revenue Chart */}
      {/* <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Monthly Revenue</h2>
        <ResponsiveContainer width="60%" height={250}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
            <Tooltip formatter={(value) => `₹${value}`} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div> */}

      {/* Grid: Properties, Bookings, Chats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Properties */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2 font-semibold">
            <FaHome /> Recent Properties
          </div>
          <ul className="space-y-3 text-sm">
            {recentProperties.map((prop) => (
              <li
                key={prop.id}
                className="flex justify-between items-center border-b pb-1 last:border-none"
              >
                <div>
                  <p className="font-semibold">{prop.name}</p>
                  <span className="text-gray-500 text-xs">{prop.city}</span>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-medium">{prop.price}</p>
                  <span
                    className={`text-xs ${
                      prop.status === "Available" ? "text-blue-500" : "text-red-500"
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2 font-semibold">
            <FaCalendarCheck /> Recent Bookings
          </div>
          <ul className="text-sm space-y-2">
            {bookings.map((b) => (
              <li key={b.id} className="flex justify-between">
                <span>{b.customer}</span>
                <span className="text-gray-500 text-xs">{b.property}</span>
                <span className="text-blue-600 text-xs">{b.date}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Messages */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2 font-semibold">
            <FaRegComments /> Recent Chats
          </div>
          <ul className="text-sm space-y-2">
            {chats.map((c) => (
              <li key={c.id} className="border-b pb-2 last:border-none">
                <p className="font-medium">{c.user}</p>
                <p className="text-gray-500 text-xs">{c.lastMessage}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboarchart;
