import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LandlordStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(
                    'https://pg-hostel.nearprop.com/api/admin/landlords/stats'
                );

                if (response.data.success) {
                    setStats(response.data.stats);
                } else {
                    setError('Failed to fetch stats');
                }
            } catch (err) {
                setError('Unable to load data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statItems = stats
        ? [
            { label: 'Total Landlords', value: stats.totalLandlords },
            { label: 'New Landlords', value: stats.newLandlords },
            { label: 'Total Properties', value: stats.totalProperties },
            { label: 'New Properties', value: stats.newProperties },
            { label: 'Active Properties', value: stats.activeProperties },
            { label: 'Total Beds', value: stats.totalBeds },
            { label: 'Occupied Beds', value: stats.occupiedBeds },
            { label: 'Occupancy Rate', value: `${stats.occupancyRate}%` },
            { label: 'Total Reels', value: stats.totalReels },
        ]
        : [];

    if (loading) {
        return (
            <div className="text-center py-12 text-gray-600">Loading stats...</div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-600">{error}</div>
        );
    }

    return (
        <div className="py-8 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Title */}
                <h1 className="text-2xl font-semibold text-gray-800 text-center mb-8">
                    Landlord & Property Overview
                </h1>

                {/* Single Row of Small Boxes */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
                    {statItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg px-4 py-5 text-center shadow-sm hover:shadow transition-shadow"
                        >
                            <div className="text-2xl font-bold text-gray-900">
                                {item.value}
                            </div>
                            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                                {item.label}
                            </div>

                        </div>
                    ))}
                </div>

                {/* Subtle Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString('en-IN')} • {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

export default LandlordStats;