// src/pages/LandlordDashboardPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { getLandlordById, getProperties } from "../../redux/slices/landlordSlice";

const Card = ({ title, value }) => (
  <div className="bg-white shadow rounded-2xl p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-xl font-semibold mt-1">{value}</div>
  </div>
);

const Avatar = ({ src, name }) => (
  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
    {src ? (
      <img src={src} alt={name} className="w-full h-full object-cover" />
    ) : (
      <span className="text-lg font-semibold text-gray-600">
        {(name || "?").charAt(0)}
      </span>
    )}
  </div>
);

export function LandlordDashboardPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { landlordDetails, properties, pagination } = useSelector((s) => s.landlords);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(getLandlordById(id));
      dispatch(getProperties({ page, limit: 6, landlordId: id, search }));
    }
  }, [dispatch, id, page, search]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
        <Link
          to="/landlords"
          className="text-sm text-indigo-600 hover:underline"
        >
          Back to list
        </Link>
      </div>

      {/* Landlord details card */}
      {landlordDetails && (
        <div className="bg-white shadow rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <Avatar src={landlordDetails.profilePhoto} name={landlordDetails.name} />
          <div className="flex-1">
            <div className="text-xl font-semibold">{landlordDetails.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {landlordDetails.email || "No email"} • {landlordDetails.mobile || "No mobile"}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card title="Properties" value={landlordDetails.propertyCount || 0} />
              <Card title="Active" value={landlordDetails.activeProperties || 0} />
              <Card title="Inactive" value={landlordDetails.inactiveProperties || 0} />
            </div>
          </div>
        </div>
      )}

      {/* Properties list */}
      <section className="bg-white shadow rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold">Properties</h2>
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm w-full sm:w-64"
          />
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => (
              <div
                key={p.id}
                className="border rounded-lg p-4 hover:shadow transition"
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">{p.location}</div>
                <div className="mt-2 text-sm">
                  Status:{" "}
                  <span
                    className={`${
                      p.isActive ? "text-green-600" : "text-red-600"
                    } font-medium`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div> 
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            No properties found
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-md border ${
                  page === i + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
