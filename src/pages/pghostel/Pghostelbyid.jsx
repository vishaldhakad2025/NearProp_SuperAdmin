import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Pghostelbyid = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPropertyById = async () => {
            try {
                const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem("subAdminToken");


                if (!token) {
                    setError("Admin token not found");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `https://pg-hostel.nearprop.com/api/landlord/admin/properties/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setProperty(response.data.property);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch property");
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyById();
    }, [id]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-white text-gray-600 text-lg font-semibold">
                Loading property details...
            </div>
        );

    if (error)
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-white text-red-600 font-semibold">
                {error}
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                            Property Details
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Detailed overview of the selected PG / Hostel.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                ${property.isActive
                                    ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                                    : "bg-red-100 text-red-800 ring-1 ring-red-200"
                                }`}
                        >
                            <span
                                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${property.isActive ? "bg-emerald-500" : "bg-red-500"
                                    }`}
                            />
                            {property.isActive ? "Active" : "Inactive"}
                        </span>

                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 ring-1 ring-indigo-200">
                            {property.type}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                            <span className="text-gray-500">ID:</span>
                            {property.propertyId}
                        </span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 md:p-8">
                    {/* Top: Basic + Location */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Basic Information */}
                        <SectionCard title="Basic Information">
                            <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                                <InfoRow label="Name" value={property.name} />
                                <InfoRow label="Status" value={property.status} pillColor="amber" />
                                <InfoRow label="Views" value={property.viewsCount} />
                            </div>
                        </SectionCard>

                        {/* Location */}
                        <SectionCard title="Location">
                            <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                                <InfoRow label="Address" value={property.address} />
                                <InfoRow label="City" value={property.city} />
                                <InfoRow label="State" value={property.state} />
                                <InfoRow label="Pincode" value={property.pinCode} />
                            </div>
                        </SectionCard>

                        {/* Landlord */}
                        <SectionCard title="Landlord">
                            <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                                <InfoRow label="Name" value={property.landlordId?.name} />
                                <InfoRow label="Email" value={property.landlordId?.email} />
                                <InfoRow label="Landlord ID" value={property.landlordId?._id} />
                            </div>
                        </SectionCard>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        <StatCard
                            label="Rooms"
                            value={property.totalRooms}
                            color="indigo"
                        />
                        <StatCard
                            label="Beds"
                            value={property.totalBeds}
                            color="cyan"
                        />
                        <StatCard
                            label="Capacity"
                            value={property.totalCapacity}
                            color="emerald"
                        />
                        <StatCard
                            label="Occupied"
                            value={property.occupiedSpace}
                            color="amber"
                        />
                        <StatCard
                            label="Monthly Collection"
                            value={`₹${property.monthlyCollection}`}
                            color="violet"
                        />
                        <StatCard
                            label="Pending Dues"
                            value={`₹${property.pendingDues}`}
                            color="rose"
                        />
                    </div>

                    {/* Ratings */}
                    <SectionCard title="Ratings & Feedback">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <MiniStat
                                label="Average Rating"
                                value={property.ratingSummary?.averageRating || "—"}
                                badge={`${property.ratingSummary?.totalRatings || 0} ratings`}
                            />
                            <MiniStat
                                label="Total Ratings"
                                value={property.ratingSummary?.totalRatings || 0}
                            />
                            <MiniStat
                                label="Comments"
                                value={property.commentCount || 0}
                            />
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

const SectionCard = ({ title, children }) => (
    <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {title}
        </h2>
        {children}
    </div>
);

const InfoRow = ({ label, value, pillColor }) => {
    if (pillColor && value) {
        const colorMap = {
            amber: "bg-amber-100 text-amber-800 ring-amber-200",
            emerald: "bg-emerald-100 text-emerald-800 ring-emerald-200",
            rose: "bg-red-100 text-red-800 ring-red-200",
        };

        return (
            <p className="flex items-center justify-between gap-3">
                <span className="text-gray-500 text-xs uppercase tracking-wide">
                    {label}
                </span>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${colorMap[pillColor]}`}
                >
                    {value}
                </span>
            </p>
        );
    }

    return (
        <p className="flex items-center justify-between gap-3">
            <span className="text-gray-500 text-xs uppercase tracking-wide">
                {label}
            </span>
            <span className="text-gray-900 text-sm text-right break-all">
                {value || "—"}
            </span>
        </p>
    );
};

/* Colored stat card for light theme */
const StatCard = ({ label, value, color = "indigo" }) => {
    const colorConfig = {
        indigo: {
            bg: "from-indigo-500/5 to-indigo-50",
            ring: "ring-indigo-200/50",
            dot: "bg-indigo-500",
            text: "text-indigo-800",
            label: "text-gray-600",
        },
        cyan: {
            bg: "from-cyan-500/5 to-cyan-50",
            ring: "ring-cyan-200/50",
            dot: "bg-cyan-500",
            text: "text-cyan-800",
            label: "text-gray-600",
        },
        emerald: {
            bg: "from-emerald-500/5 to-emerald-50",
            ring: "ring-emerald-200/50",
            dot: "bg-emerald-500",
            text: "text-emerald-800",
            label: "text-gray-600",
        },
        amber: {
            bg: "from-amber-500/5 to-amber-50",
            ring: "ring-amber-200/50",
            dot: "bg-amber-500",
            text: "text-amber-800",
            label: "text-gray-600",
        },
        violet: {
            bg: "from-violet-500/5 to-violet-50",
            ring: "ring-violet-200/50",
            dot: "bg-violet-500",
            text: "text-violet-800",
            label: "text-gray-600",
        },
        rose: {
            bg: "from-rose-500/5 to-rose-50",
            ring: "ring-rose-200/50",
            dot: "bg-rose-500",
            text: "text-rose-800",
            label: "text-gray-600",
        },
    }[color];

    return (
        <div
            className={`relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br ${colorConfig.bg} p-4 ring-1 ${colorConfig.ring}`}
        >
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <p className={`text-[11px] uppercase tracking-wide ${colorConfig.label}`}>
                        {label}
                    </p>
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${colorConfig.dot} shadow-sm shadow-black/20`}
                    />
                </div>
                <p className={`text-lg font-semibold ${colorConfig.text}`}>
                    {value ?? "—"}
                </p>
            </div>
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-16 w-16 rounded-full border border-dashed border-gray-200/50" />
        </div>
    );
};

const MiniStat = ({ label, value, badge }) => (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
                {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
        </div>
        {badge && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200">
                {badge}
            </span>
        )}
    </div>
);

export default Pghostelbyid;
