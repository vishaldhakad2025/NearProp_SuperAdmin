// src/pages/LandlordsListPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getLandlords } from "../../redux/slices/landlordSlice";
import { Spin } from "antd";

const Avatar = ({ src, name }) => (
  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
    {src ? (
      <img src={src} alt={name} className="w-full h-full object-cover" />
    ) : (
      <span className="text-lg font-semibold text-gray-600">
        {(name || "?").charAt(0)}
      </span>
    )}
  </div>
);

export function LandlordsListPage() {
  const dispatch = useDispatch();
  const { landlords, pagination, loading, error } = useSelector((state) => state.landlords);
  console.log(landlords, "landlords");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [countFilter, setCountFilter] = useState("all");

  useEffect(() => {
    dispatch(getLandlords({ page, limit, search, countFilter }));
  }, [dispatch, page, limit, search, countFilter]);

  if (error) {
    return <div className="p-6 text-center text-red-600">{error.message || "Failed to load landlords"}</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">All Landlords</h1>
        <div className="flex gap-2">
          {/* Search box */}
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or mobile"
            className="px-3 py-2 border rounded-lg w-64"
          />

          {/* Filter dropdown */}
          <select
            value={countFilter}
            onChange={(e) => {
              setCountFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All</option>
            <option value="0">No properties</option>
            <option value="1-5">1–5 properties</option>
            <option value="6+">6+ properties</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white shadow rounded-2xl p-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : landlords?.length > 0 ? (
          <div className="divide-y">
            {landlords.map((l) => (
              <Link
                key={l.id}
                to={`/dashboard/landlords/${l.id}`}
                className="flex items-center gap-4 p-3 hover:bg-gray-50"
              >
                <Avatar src={l.profilePhoto} name={l.name} />
                <div className="flex-1">
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-sm text-gray-500">
                    {l.email} • {l.mobile}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Properties: {l.propertyCount}
                </div>
              </Link>
            ))}

            {/* Pagination */}
            <div className="p-3 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Total: {pagination?.total ?? 0}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  disabled={page === 1}
                >
                  Prev
                </button>
                <div className="px-3">
                  {page} / {pagination?.pages ?? 1}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(pagination?.pages ?? p, p + 1))}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  disabled={page === (pagination?.pages ?? 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No landlords found</div>
        )}
      </div>
    </div>
  );
}