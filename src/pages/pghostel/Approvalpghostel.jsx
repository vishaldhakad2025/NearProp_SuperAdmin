import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toastError, toastSuccess, toastWarning } from '../../utils/toast';

function ApprovalPgHostel() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        id: '',
        name: '',
        number: '',
        email: '',
    });

    const [viewModal, setViewModal] = useState({ open: false, property: null });

    const navigate = useNavigate();

    const API_BASE = 'https://pg-hostel.nearprop.com';
    // const API_BASE = 'http://localhost:3002'; // ← uncomment for local development

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem("subAdminToken");

                if (!token) throw new Error('No authentication token found');

                const res = await fetch(`${API_BASE}/api/landlord/properties/pending-properties/admin`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const result = await res.json();

                if (result.success) {
                    setData(result.properties || []);
                    setFilteredData(result.properties || []);

                    // Debug tip: Check what real status values look like
                    if (result.properties?.length > 0) {
                        console.log("Real status values in database:",
                            [...new Set(result.properties.map(p => p.status))]);
                    }
                } else {
                    throw new Error(result.message || 'Failed to load pending properties');
                }
            } catch (err) {
                setError(err.message);
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter logic
    useEffect(() => {
        const filtered = data.filter((property) => {
            return (
                (filters.id === '' || property._id?.toString().includes(filters.id)) &&
                (filters.name === '' || property.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
                (filters.email === '' || property.landlordId?.email?.toLowerCase().includes(filters.email.toLowerCase()))
            );
        });

        setFilteredData(filtered);
    }, [data, filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleApprove = async (propertyId) => {
        if (!window.confirm('Are you sure you want to APPROVE this property?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await fetch(
                `${API_BASE}/api/landlord/properties/${propertyId}/status/admin`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "status": "APPROVED"
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || `Failed to approve (HTTP ${response.status})`);
            }

            // Remove from list on success
            setData(prev => prev.filter(p => p._id !== propertyId));
            toastSuccess('Property approved successfully!');
        } catch (err) {
            console.error('Approve error:', err);
            toastWarning(`Approval failed: ${err.message}`);
        }
    };

    const handleReject = async (propertyId) => {
        const reason = window.prompt('Enter rejection reason:', 'Incomplete documents');

        if (reason === null) return; // user cancelled
        const trimmedReason = reason.trim();
        if (!trimmedReason) {
            toastWarning('Rejection reason is required!');
            return;
        }

        if (!window.confirm(`Reject this property?\n\nReason: ${trimmedReason}`)) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await fetch(
                `${API_BASE}/api/landlord/properties/${propertyId}/status/admin`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "status": "REJECTED",

                        reason: trimmedReason
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || `Failed to reject (HTTP ${response.status})`);
            }

            setData(prev => prev.filter(p => p._id !== propertyId));
            toastSuccess('Property rejected successfully!');
        } catch (err) {
            console.error('Reject error:', err);
            toastError(`Rejection failed: ${err.message}`);
        }
    };

    const handleviewid = (id) => {
        navigate(`/pghostelbyid/${id}`)
    };

    const handleBack = () => navigate(-1);

    if (loading) return <div className="text-center mt-20 text-xl">Loading pending properties...</div>;

    if (error) return <div className="text-center mt-20 text-red-600 text-xl">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Pending PG / Hostel Approvals</h1>
                <button
                    onClick={handleBack}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    ← Back
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <input
                        name="name"
                        placeholder="Filter by Property Name"
                        value={filters.name}
                        onChange={handleFilterChange}
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {/* <input
                        name="number"
                        placeholder="Filter by Phone (not available)"
                        disabled
                        className="border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                    /> */}
                    {/* <input
                        name="email"
                        placeholder="Filter by Owner Email"
                        value={filters.email}
                        onChange={handleFilterChange}
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    /> */}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Owner</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Property</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">City</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.length > 0 ? (
                                filteredData.map((property) => (
                                    <tr key={property._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">{property.landlord?.name || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{property.name || 'Unnamed'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">N/A</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{property.landlord?.email || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{property.city || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${property.type === 'PG' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {property.type || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    // onClick={() => handleView(property)}
                                                    onClick={() => handleviewid(property._id)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(property._id)}
                                                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(property._id)}
                                                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        No pending properties found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ApprovalPgHostel;