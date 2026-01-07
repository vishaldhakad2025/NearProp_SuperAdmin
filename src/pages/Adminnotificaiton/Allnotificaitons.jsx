import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment'; // Optional: for better date formatting

const AllNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [filterSendTo, setFilterSendTo] = useState('ALL');
    const [filterState, setFilterState] = useState('ALL');
    const [filterRole, setFilterRole] = useState('ALL');
    const [filterHasImage, setFilterHasImage] = useState('ALL');

    const API_URL = 'https://api.nearprop.com/api/v1/admin/notifications';
    const TOKEN = localStorage.getItem("token")
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_URL, {
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                    },
                });

                if (response.data.success) {
                    const sortedNotifications = response.data.data.sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setNotifications(sortedNotifications);
                    setFilteredNotifications(sortedNotifications);
                }
            } catch (err) {
                setError('Failed to fetch notifications. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Apply filters whenever filter values or notifications change
    useEffect(() => {
        let filtered = [...notifications];

        if (filterSendTo !== 'ALL') {
            filtered = filtered.filter((n) => n.sendTo === filterSendTo);
        }

        if (filterState !== 'ALL') {
            filtered = filtered.filter((n) => n.state === filterState);
        }

        if (filterRole !== 'ALL') {
            filtered = filtered.filter((n) => n.roles.includes(filterRole));
        }

        if (filterHasImage === 'YES') {
            filtered = filtered.filter((n) => n.imageUrl && n.imageUrl.trim() !== '');
        } else if (filterHasImage === 'NO') {
            filtered = filtered.filter((n) => !n.imageUrl || n.imageUrl.trim() === '');
        }

        setFilteredNotifications(filtered);
    }, [filterSendTo, filterState, filterRole, filterHasImage, notifications]);

    // Unique values for filters
    const sendToOptions = ['ALL', 'ALL', 'STATE', 'DISTRICT', 'ROLE'];
    const stateOptions = ['ALL', 'Madhya Pradesh'];
    const roleOptions = ['ALL', 'USER', 'ADMIN', 'DEVELOPER', 'ADVISOR', 'SELLER', 'FRANCHISEE'];

    if (loading) {
        return <div className="p-8 text-center">Loading notifications...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">All Admin Notifications</h1>

            {/* Filters */}
            <div className="bg-gray-100 p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Send To</label>
                    <select
                        value={filterSendTo}
                        onChange={(e) => setFilterSendTo(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        {sendToOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        {stateOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        {roleOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Has Image</label>
                    <select
                        value={filterHasImage}
                        onChange={(e) => setFilterHasImage(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="ALL">All</option>
                        <option value="YES">Yes</option>
                        <option value="NO">No</option>
                    </select>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-6">
                {filteredNotifications.length === 0 ? (
                    <p className="text-center text-gray-500">No notifications match the selected filters.</p>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div key={notif.id} className="bg-white shadow-lg rounded-lg p-6 border">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {notif.title || <span className="text-gray-400 italic">(No Title)</span>}
                                    </h3>
                                    <p className="text-gray-700 mt-2">{notif.body || <span className="italic text-gray-400">(No Body)</span>}</p>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {moment(notif.createdAt).format('DD MMM YYYY, hh:mm A')}
                                </span>
                            </div>

                            {notif.imageUrl && notif.imageUrl.trim() !== '' && (
                                <img
                                    src={notif.imageUrl}
                                    alt="Notification"
                                    className="mt-4 max-w-md rounded-lg shadow"
                                    onError={(e) => (e.target.style.display = 'none')}
                                />
                            )}

                            <div className="mt-6 flex flex-wrap gap-3 text-sm">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                    Send To: <strong>{notif.sendTo}</strong>
                                </span>
                                {notif.state && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                        State: <strong>{notif.state}</strong>
                                    </span>
                                )}
                                {notif.districtId && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                                        District ID: <strong>{notif.districtId}</strong>
                                    </span>
                                )}
                                {notif.roles.length > 0 && (
                                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                                        Roles: <strong>{notif.roles.join(', ')}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllNotifications;