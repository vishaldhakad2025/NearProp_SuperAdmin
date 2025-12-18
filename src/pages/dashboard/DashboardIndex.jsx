// DashboardIndex.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDistrictStats, fetchTypeStats } from "../../redux/slices/dashboardSlice";
import { FaMapMarkerAlt, FaCity, FaLayerGroup } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const DashboardIndex = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { districtStats, typeStats, loading, error } = useSelector((state) => state.dashboard);
  
  useEffect(() => {
    dispatch(fetchDistrictStats());
    dispatch(fetchTypeStats());
  }, [dispatch]);
  
  const totalProperties = Object.values(typeStats).reduce((sum, count) => sum + count, 0);
  const totalDistricts = Object.keys(districtStats).length;

  const mostActiveDistrict =
    Object.entries(districtStats).reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0])[0] || "N/A";

  return (
    <div className="space-y-10 px-4 max-w-7xl">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-gray-200 rounded-xl p-6 h-28" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card
            icon={<MdOutlineDashboard size={28} />}
            title="Total Properties"
            value={totalProperties}
            iconColor="bg-indigo-100 text-indigo-600"
            onClick={() => navigate("/dashboard/propertysearch?filter=all")}
          />
          <Card
            icon={<FaCity size={28} />}
            title="Total Districts"
            value={totalDistricts}
            iconColor="bg-green-100 text-green-600"
            onClick={() => navigate("/dashboard/propertysearch?filter=districts")}
          />
          <Card
            icon={<FaMapMarkerAlt size={28} />}
            title="Most Active District"
            value={mostActiveDistrict}
            iconColor="bg-yellow-100 text-yellow-600"
            onClick={() => navigate(`/dashboard/propertysearch?district=${mostActiveDistrict}`)}
          />
        </div>
      )}

      {/* Properties by Type */}
      {!loading && !error && (
        <section>
          <SectionTitle title="🏢 Properties by Type" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(typeStats).map(([type, count]) => (
              <StatCard
                key={type}
                icon={<FaLayerGroup size={22} />}
                count={count}
                label={type.replace(/_/g, " ")}
                iconColor="bg-blue-100 text-blue-600"
                onClick={() => navigate(`/dashboard/propertysearch?type=${type}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Properties by District */}
      {!loading && !error && (
        <section>
          <SectionTitle title="📍 Properties by District" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(districtStats).map(([district, count]) => (
              <StatCard
                key={district}
                icon={<FaMapMarkerAlt size={20} />}
                count={count}
                label={district}
                iconColor="bg-green-100 text-green-600"
                onClick={() => navigate(`/dashboard/propertysearch?district=${district}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const Card = ({ icon, title, value, iconColor, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-200"
  >
    <div className="flex items-center justify-between">
      <div className="text-4xl font-bold text-gray-800">{value}</div>
      <div className={`p-3 rounded-full ${iconColor} shadow-sm`}>{icon}</div>
    </div>
    <p className="mt-2 text-lg font-medium text-gray-600">{title}</p>
  </div>
);

const StatCard = ({ icon, count, label, iconColor, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all"
  >
    <div className={`p-3 rounded-full ${iconColor} shadow-sm`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-gray-600 capitalize text-sm">{label}</p>
    </div>
  </div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
    {title}
  </h2>
);

export default DashboardIndex;
