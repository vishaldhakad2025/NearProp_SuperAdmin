import React, { useState } from "react";

const UserList = ({ users, loading, error, roles }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const filteredUsers = users.filter(user =>
    (roleFilter ? user.roles.includes(roleFilter) : true) &&
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
     user.mobileNumber.includes(search))
  );

  if (loading) {
    return <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-40 rounded-xl"></div>
      ))}
    </div>;
  }

  if (error) {
    return <div className="bg-red-100 p-4 rounded-lg text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-4 flex flex-col items-center text-center"
          >
            <img
              src={user.profileImageUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-gray-100 mb-3"
            />
            <h3 className="text-lg font-bold">{user.name}</h3>
            <p className="text-gray-500 text-sm">{user.mobileNumber}</p>
            <p className="text-xs text-gray-400">{user.permanentId}</p>
            
            {/* Roles */}
            <span className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-600">
              {user.roles.join(", ")}
            </span>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-4 mt-4 w-full text-sm">
              <div>
                <p className="font-bold">{user.propertyCount}</p>
                <p className="text-gray-500">Properties</p>
              </div>
              <div>
                <p className="font-bold">{user.subscriptionCount}</p>
                <p className="text-gray-500">Subscriptions</p>
              </div>
              <div>
                <p className="font-bold">{user.reviewCount}</p>
                <p className="text-gray-500">Reviews</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
