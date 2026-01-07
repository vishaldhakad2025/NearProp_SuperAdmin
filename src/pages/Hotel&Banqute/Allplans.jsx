import React, { useEffect, useState } from "react";
import axios from "axios";

function Allplans({ onEdit, onDelete }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [planTypeFilter, setPlanTypeFilter] = useState("all");
    const [planForFilter, setPlanForFilter] = useState("all");

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("subAdminToken");

            const res = await axios.get(
                "https://hotel-banquet.nearprop.in/api/subscriptions/plans",
                token
                    ? { headers: { Authorization: `Bearer ${token}` } }
                    : {}
            );
            setPlans(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch plans:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // Apply filters
    const filteredPlans = plans.filter((plan) => {
        const typeMatch =
            planTypeFilter === "all" || plan.planType === planTypeFilter;
        const forMatch =
            planForFilter === "all" || plan.planFor === planForFilter;
        return typeMatch && forMatch;
    });

    const hotelPlans = filteredPlans.filter((p) => p.planFor === "hotel");
    const banquetPlans = filteredPlans.filter((p) => p.planFor === "banquet");

    const getPlanTypeLabel = (type) => {
        const labels = {
            monthly: "Monthly",
            quarterly: "Quarterly",
            half_yearly: "Half Yearly",
            yearly: "Yearly",
            "3_years": "3 Years",
        };
        return labels[type] || type;
    };

    const PlanCard = ({ plan }) => (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full">
            <div className="p-7 flex-grow">
                {/* Header: Name + Status */}
                <div className="flex justify-between items-start mb-5">
                    <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                    <span
                        className={`px-4 py-2 text-sm font-semibold rounded-full ${plan.isActive === false
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                            }`}
                    >
                        {plan.isActive === false ? "Inactive" : "Active"}
                    </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-semibold text-gray-600">Category:</span>
                        <p className="text-gray-800 capitalize">{plan.planFor}</p>
                    </div>

                    <div>
                        <span className="font-semibold text-gray-600">Type:</span>
                        <p className="text-gray-800">{getPlanTypeLabel(plan.planType)}</p>
                    </div>

                    <div>
                        <span className="font-semibold text-gray-600">Price:</span>
                        <p className="text-2xl font-bold text-green-600">₹{plan.price}</p>
                    </div>

                    <div>
                        <span className="font-semibold text-gray-600">Reels Limit:</span>
                        <p className="text-gray-800">
                            {plan.reelsLimit || "Unlimited"}
                        </p>
                    </div>

                    {plan.planFor === "hotel" && (
                        <>
                            <div>
                                <span className="font-semibold text-gray-600">Room Limit:</span>
                                <p className="text-gray-800">
                                    {plan.roomLimit || "Unlimited"}
                                </p>
                            </div>
                            {plan.hotelLimit !== undefined && (
                                <div>
                                    <span className="font-semibold text-gray-600">Hotel Limit:</span>
                                    <p className="text-gray-800">{plan.hotelLimit}</p>
                                </div>
                            )}
                        </>
                    )}

                    {plan.planFor === "banquet" && plan.banquetHallLimit !== undefined && (
                        <div>
                            <span className="font-semibold text-gray-600">Hall Limit:</span>
                            <p className="text-gray-800">{plan.banquetHallLimit}</p>
                        </div>
                    )}

                    <div className="col-span-2">
                        <span className="font-semibold text-gray-600">Duration:</span>
                        <p className="text-gray-800">{plan.durationInDays} days</p>
                    </div>
                </div>

                {/* Description */}
                {plan.description && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                        <p className="text-gray-600 italic text-sm leading-relaxed">
                            {plan.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="px-7 pb-7 mt-auto">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onEdit(plan)}
                        className="py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition transform hover:scale-105 shadow-md"
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onClick={() => onDelete(plan._id, plan.name)}
                        className="py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition transform hover:scale-105 shadow-md"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    );

    // Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-2xl shadow-lg p-7 animate-pulse"
                >
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-4">
                        <div className="h-5 bg-gray-200 rounded"></div>
                        <div className="h-5 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-5 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="h-12 bg-gray-200 rounded-xl"></div>
                        <div className="h-12 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full space-y-10">
            {/* Filters & Refresh */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-gray-50 p-6 rounded-2xl">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">Filter Plans</h3>
                    <p className="text-gray-600 mt-1">Narrow down by category or type</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <select
                        value={planForFilter}
                        onChange={(e) => setPlanForFilter(e.target.value)}
                        className="px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none transition"
                    >
                        <option value="all">All Categories</option>
                        <option value="hotel">🏨 Hotels Only</option>
                        <option value="banquet">🎉 Banquets Only</option>
                    </select>

                    <select
                        value={planTypeFilter}
                        onChange={(e) => setPlanTypeFilter(e.target.value)}
                        className="px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none transition"
                    >
                        <option value="all">All Types</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="half_yearly">Half Yearly</option>
                        <option value="yearly">Yearly</option>
                        <option value="3_years">3 Years</option>
                    </select>

                    <button
                        onClick={fetchPlans}
                        className="px-6 py-3 bg-blue-200 hover:bg-white-800 text-white font-bold rounded-xl transition flex items-center gap-3 shadow-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Loading or No Results */}
            {loading ? (
                <LoadingSkeleton />
            ) : filteredPlans.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-2xl text-gray-500">No plans found matching your filters.</p>
                    <p className="text-gray-400 mt-4">Try adjusting the filters or create a new plan above.</p>
                </div>
            ) : (
                <>
                    {/* Hotel Plans */}
                    {hotelPlans.length > 0 && (
                        <section>
                            <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-4">
                                <span className="text-4xl">🏨</span>
                                Hotel Plans
                                <span className="text-xl font-normal text-gray-500">({hotelPlans.length})</span>
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {hotelPlans.map((plan) => (
                                    <PlanCard key={plan._id} plan={plan} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Banquet Plans */}
                    {banquetPlans.length > 0 && (
                        <section>
                            <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-4 mt-16">
                                <span className="text-4xl">🎉</span>
                                Banquet Plans
                                <span className="text-xl font-normal text-gray-500">({banquetPlans.length})</span>
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {banquetPlans.map((plan) => (
                                    <PlanCard key={plan._id} plan={plan} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}

export default Allplans;