// src/pages/properties/PropertyTypeStats.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPropertyStatsByType } from "../../redux/slices/propertySlice";
import { Card, Spin } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const PropertyTypeStats = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { propertyTypeStats, loading } = useSelector((state) => state.property);

  useEffect(() => {
    dispatch(getPropertyStatsByType());
  }, [dispatch]);

  const chartData = Object.entries(propertyTypeStats || {}).map(
    ([type, count]) => ({
      type,
      count,
    })
  );

  const handleCardClick = (type) => {
    // Navigate to search page with query param
    navigate(`/dashboard/propertysearch?type=${encodeURIComponent(type)}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">🏠 Property Stats by Type</h2>

      {loading ? (
        <Spin fullscreen />
      ) : (
        <>
          {/* Chart */}
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chartData.map(({ type, count }) => (
              <Card
                key={type}
                title={type}
                bordered
                hoverable
                className="cursor-pointer transition-transform transform hover:scale-105"
                onClick={() => handleCardClick(type)}
              >
                <p className="text-2xl font-bold text-blue-600">
                  {count} Properties
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyTypeStats;
