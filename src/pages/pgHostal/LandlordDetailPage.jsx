// src/pages/LandlordsListPage.jsx - Full page to list all landlords with pagination, search, and token authentication support

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // Or use your existing api instance

const API_BASE = "https://pg-hostel.nearprop.com/api/admin";

const Avatar = ({ src, name }) => (
  <div className="relative">
    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden flex items-center justify-center">
      {src ? (
        <img src={`https://pg-hostel.nearprop.com${src}`} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-lg font-bold text-white">
          {name?.charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </div>
  </div>
);

const Card = ({ landlord }) => (
  <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-100">
    <div className="flex items-center space-x-4">
      <Avatar src={landlord.profilePhoto} name={landlord.name} />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{landlord.name}</h3>
        <p className="text-sm text-gray-600">{landlord.email}</p>
        <p className="text-sm text-gray-600">{landlord.mobile}</p>
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
          <span>Properties: {landlord.propertyCount}</span>
          <span>•</span>
          <span>Joined: {new Date(landlord.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <Link
        to={`/dashboard/landlords/${landlord.id}`}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        View Details
      </Link>
    </div>
  </div>
);

export function LandlordDetailsPage() {
  const [landlords, setLandlords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Replace with your actual token source (e.g., localStorage, Redux, context)
  const getToken = () => localStorage.getItem("token") || "";

  const fetchLandlords = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_BASE}/landlords`, {
        params: { page, limit: 10, search },
        headers,
      });
      console.log(response)

      // Response structure based on current API
      setLandlords(response.data.landlords || []);
      setPagination(response.data.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch landlords");
      setLandlords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlords();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLandlords();
  };

  if (loading && landlords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Loading landlords...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <p className="text-red-800">{error}</p>
          <button onClick={fetchLandlords} className="mt-4 text-indigo-600 hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Landlords</h1>
          <p className="text-gray-600 mt-1">Manage and view all registered landlords</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} landlords
        </div>

        {/* Landlords Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {landlords.map((landlord) => (
            <Card key={landlord.id} landlord={landlord} />
          ))}
        </div>

        {/* Empty State */}
        {landlords.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No landlords found.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}