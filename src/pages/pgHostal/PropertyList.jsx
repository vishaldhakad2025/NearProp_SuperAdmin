// src/components/PropertyList.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

export function PropertyList({ properties, isLoading, error, noResultsMessage = "No properties found", categoryFilter = "" }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading properties...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 font-medium">{error.message || "Failed to load properties"}</div>
      </div>
    );
  }

  // Filter properties by category if filter is applied
  const filteredProperties = categoryFilter ? 
    properties.filter(p => p.type?.toLowerCase() === categoryFilter.toLowerCase()) : 
    properties;

  // Modal for property details
  const PropertyModal = ({ property, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <p className="text-gray-900">{property.address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <p className="text-gray-900">{property.city}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pin Code</label>
              <p className="text-gray-900">{property.pinCode}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                property.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {property.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Landlord Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Landlord Information</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {property.landlord.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{property.landlord.name}</p>
                  <p className="text-sm text-gray-600">{property.landlord.email}</p>
                  <p className="text-sm text-gray-600">{property.landlord.mobile}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {property.stats && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Property Stats</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{property.stats.roomCount}</div>
                  <div className="text-xs text-blue-800 uppercase tracking-wide">Rooms</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{property.stats.bedCount}</div>
                  <div className="text-xs text-green-800 uppercase tracking-wide">Beds</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{property.stats.occupiedBedCount}</div>
                  <div className="text-xs text-orange-800 uppercase tracking-wide">Occupied</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{property.stats.occupancyRate}%</div>
                  <div className="text-xs text-purple-800 uppercase tracking-wide">Occupancy</div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {property.type && (
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800">
                {property.type.toUpperCase()}
              </span>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>Created: {new Date(property.createdAt).toLocaleDateString('en-IN', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Category Filter Info */}
      {categoryFilter && (
        <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
          <span className="text-sm font-medium text-indigo-800">
            Showing {filteredProperties.length} {categoryFilter.toUpperCase()} properties
          </span>
        </div>
      )}

      {/* Properties Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProperties && filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {property.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{property.name}</div>
                        <div className="text-xs text-gray-500">
                          {property.landlord.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.address}</div>
                    <div className="text-xs text-gray-500">{property.city} - {property.pinCode}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      property.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {property.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {property.type ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {property.type.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {property.stats ? (
                      <div className="text-sm space-y-1">
                        <div className="text-xs text-gray-500">Rooms: {property.stats.roomCount}</div>
                        <div className="text-xs text-gray-500">Beds: {property.stats.bedCount}</div>
                        <div className={`text-xs font-medium ${
                          property.stats.occupancyRate > 70 ? 'text-green-600' :
                          property.stats.occupancyRate > 30 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {property.stats.occupancyRate}% occupied
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No stats</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(property.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-500 space-y-2">
                    <div className="text-lg">📭</div>
                    <p className="text-sm">{noResultsMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Property Details Modal */}
      {showModal && selectedProperty && (
        <PropertyModal 
          property={selectedProperty} 
          onClose={() => {
            setShowModal(false);
            setSelectedProperty(null);
          }} 
        />
      )}
    </>
  );
}