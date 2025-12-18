// Updated src/pages/LandlordDetailsPage.jsx (with enhanced filters)
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { getLandlordById, getProperties } from "../../redux/slices/landlordSlice";
import { PropertyList } from "./PropertyList";

const Card = ({ title, value, icon: Icon, color = "indigo" }) => (
  <div className={`bg-white shadow-sm rounded-xl p-6 border-l-4 border-${color}-500`}>
    <div className="flex items-center">
      <div className={`p-2 rounded-lg bg-${color}-50 mr-3`}>
        {Icon && <Icon className={`w-5 h-5 text-${color}-600`} />}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      </div>
    </div>
  </div>
);

const Avatar = ({ src, name }) => (
  <div className="relative">
    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden flex items-center justify-center">
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-2xl font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
    <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full p-1">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
);

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }`}>
    {isActive ? 'Active' : 'Inactive'}
    <svg className={`ml-1 w-2 h-2 ${isActive ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
  </span>
);

export function LandlordDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { landlordDetails, properties, pagination, loading, error } = useSelector((state) => state.landlords);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (id) {
      dispatch(getLandlordById(id));
      dispatch(getProperties({ page, limit, landlordId: id, search, category }));
    }
  }, [dispatch, id, page, search, category]);

  // Filter by status client-side since backend might not support it
  const filteredProperties = React.useMemo(() => {
    let filtered = properties;
    if (statusFilter === "active") {
      filtered = filtered.filter(p => p.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(p => !p.isActive);
    }
    return filtered;
  }, [properties, statusFilter]);

  const totalPages = Math.ceil((pagination?.total || 0) / limit);

  if (loading && !landlordDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Loading landlord details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <p className="text-red-800">{error.message || "Failed to load landlord details"}</p>
        </div>
      </div>
    );
  }

  if (!landlordDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">
          <h2 className="text-2xl font-bold mb-2">Landlord Not Found</h2>
          <Link to="/dashboard/landlords" className="text-indigo-600 hover:underline">
            Back to Landlords List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar src={landlordDetails.profilePhoto} name={landlordDetails.name} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{landlordDetails.name}</h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>{landlordDetails.email || "No email"}</span>
                  <span>•</span>
                  <span>{landlordDetails.mobile || "No mobile"}</span>
                  <StatusBadge isActive={landlordDetails.isActive || true} />
                </div>
              </div>
            </div>
            <Link
              to="/dashboard/landlords"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            title="Total Properties" 
            value={landlordDetails.propertyCount || 0}
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-6 0h6" />
              </svg>
            )}
            color="indigo"
          />
          <Card 
            title="Active" 
            value={landlordDetails.activeProperties || 0}
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            color="green"
          />
          <Card 
            title="Inactive" 
            value={landlordDetails.inactiveProperties || 0}
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            color="red"
          />
        </div>

        {/* Properties Section */}
        <section className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Properties</h2>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-64"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Category Filter */}
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="pg">PG</option>
                  <option value="hostel">Hostel</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                {/* Results Count */}
                <div className="text-sm text-gray-500">
                  Showing {filteredProperties.length} of {pagination?.total || 0} properties
                </div>
              </div>
            </div>
          </div>

          {/* Property List */}
          <div className="p-0">
            <PropertyList 
              properties={filteredProperties} 
              isLoading={loading} 
              error={error} 
              categoryFilter={category}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}