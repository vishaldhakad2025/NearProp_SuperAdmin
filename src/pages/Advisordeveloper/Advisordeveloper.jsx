import React, { useState, useEffect } from "react";
import axios from "axios";
import { toastSuccess, toastError } from "../../utils/toast";

const Advisordeveloper = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "ADVISOR",
        subType: "PROFILE",
        price: "",
        durationDays: "",
        maxProperties: "",
        maxReelsPerProperty: "",
        maxTotalReels: "",
        active: true,
    });

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);

    // Correct API endpoint for subscription plans
    const API_URL = "https://api.nearprop.com/api/admin/subscription-plans";
    const ALL_API_URL = "https://api.nearprop.com/api/subscriptions/plans";

    const fetchPlans = async () => {
        setFetchLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toastError("Authentication required");
                setFetchLoading(false);
                return;
            }
            const res = await axios.get(ALL_API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Filter plans where type is ADVISOR or DEVELOPER
            const filteredPlans = (res.data.data || []).filter(
                (plan) => plan.type === "ADVISOR" || plan.type === "DEVELOPER"
            );

            setPlans(filteredPlans);
        } catch (error) {
            console.error("Failed to fetch plans:", error);
            toastError("Failed to load subscription plans");
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            type: "ADVISOR",
            subType: "PROFILE",
            price: "",
            durationDays: "",
            maxProperties: "",
            maxReelsPerProperty: "",
            maxTotalReels: "",
            active: true,
        });
        setEditingPlan(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toastError("Authentication required");
                setLoading(false);
                return;
            }

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                type: formData.type, // ADVISOR or DEVELOPER
                type_s: formData.subType, // PROFILE or PROPERTY
                price: parseFloat(formData.price),
                durationDays: parseInt(formData.durationDays, 10),
                maxProperties: parseInt(formData.maxProperties || 0, 10),
                maxReelsPerProperty: parseInt(formData.maxReelsPerProperty || 0, 10),
                maxTotalReels: parseInt(formData.maxTotalReels || 0, 10),
                active: formData.active,
            };

            if (editingPlan) {
                await axios.put(`${API_URL}/${editingPlan.id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                toastSuccess("Plan updated successfully!");
            } else {
                await axios.post(API_URL, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                toastSuccess("Plan created successfully!");
            }

            resetForm();
            fetchPlans();
        } catch (error) {
            console.error("Error:", error);
            const msg =
                error.response?.data?.message ||
                error.response?.data?.errors?.[0] ||
                "Operation failed";
            toastError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name || "",
            description: plan.description || "",
            type: plan.type || "ADVISOR",
            subType: plan.type_s || "PROFILE",
            price: plan.price?.toString() || "",
            durationDays: plan.durationDays?.toString() || "",
            maxProperties: plan.maxProperties?.toString() || "",
            maxReelsPerProperty: plan.maxReelsPerProperty?.toString() || "",
            maxTotalReels: plan.maxTotalReels?.toString() || "",
            active: plan.active !== false,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toastSuccess("Plan deleted successfully!");
            fetchPlans();
        } catch (error) {
            toastError("Failed to delete plan");
        }
    };

    const getTypeColor = (subType) => {
        return subType === "PROFILE"
            ? "bg-purple-100 text-purple-700"
            : "bg-teal-100 text-teal-700";
    };

    const PlanCard = ({ plan }) => {
        const displayType = `${plan.type} (${plan.type_s || "N/A"})`;
        const hasUnlimitedProperties = plan.maxProperties === -1;
        const hasUnlimitedReelsPerProperty = plan.maxReelsPerProperty === -1;
        const hasUnlimitedTotalReels = plan.maxTotalReels === -1;

        return (
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-7 border border-gray-100 flex flex-col h-full">
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>

                        <div className="flex items-center gap-3 mt-2">
                            <span
                                className={`px-3 py-1 text-xs font-bold rounded-full ${getTypeColor(plan.type_s || "PROFILE")}`}
                            >
                                {displayType}
                            </span>

                            <span className="text-sm text-gray-500">ID: {plan.id}</span>
                        </div>
                    </div>

                    <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${plan.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        {plan.active ? "Active" : "Inactive"}
                    </span>
                </div>

                <p className="text-gray-600 mb-6 italic flex-grow">
                    {plan.description}
                </p>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-600">Price</span>
                        <p className="text-xl font-bold text-green-600">₹{plan.price}</p>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-600">Duration</span>
                        <p className="font-bold">{plan.durationDays} days</p>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-600">Max Properties</span>
                        <p className="font-bold">
                            {hasUnlimitedProperties ? "Unlimited" : (plan.maxProperties || "0")}
                        </p>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-600">Reels per Property</span>
                        <p className="font-bold">
                            {hasUnlimitedReelsPerProperty ? "Unlimited" : (plan.maxReelsPerProperty || "0")}
                        </p>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-600">Total Reels</span>
                        <p className="font-bold">
                            {hasUnlimitedTotalReels ? "Unlimited" : (plan.maxTotalReels || "0")}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-auto">
                    <button
                        onClick={() => handleEdit(plan)}
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition shadow"
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => handleDelete(plan.id, plan.name)}
                        className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition shadow"
                    >
                        Delete
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
            {/* Create/Edit Form */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white">
                        {editingPlan
                            ? `Edit ${formData.type} Plan`
                            : "Create New Subscription Plan"}
                    </h2>
                    <p className="text-indigo-100 mt-2">
                        Manage plans for Advisors and Developers with Profile or Property sub-types
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        {/* Plan Type Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Plan Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="ADVISOR">Advisor</option>
                                <option value="DEVELOPER">Developer</option>
                            </select>
                        </div>

                        {/* Sub-Type Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sub Plan Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="subType"
                                value={formData.subType}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="PROFILE">Profile</option>
                                <option value="PROPERTY">Property</option>
                            </select>
                        </div>

                        {/* Plan Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Plan Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Pro Advisor Plan"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="499.00"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Duration (Days) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="durationDays"
                                value={formData.durationDays}
                                onChange={handleChange}
                                required
                                min="1"
                                placeholder="30"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Max Properties */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Max Properties
                            </label>
                            <input
                                type="number"
                                name="maxProperties"
                                value={formData.maxProperties}
                                onChange={handleChange}
                                min="-1"
                                placeholder="10"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Max Reels Per Property */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Max Reels Per Property
                            </label>
                            <input
                                type="number"
                                name="maxReelsPerProperty"
                                value={formData.maxReelsPerProperty}
                                onChange={handleChange}
                                min="-1"
                                placeholder="5"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Max Total Reels */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Max Total Reels
                            </label>
                            <input
                                type="number"
                                name="maxTotalReels"
                                value={formData.maxTotalReels}
                                onChange={handleChange}
                                min="-1"
                                placeholder="50"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Active Toggle */}
                        <div className="md:col-span-2 flex items-center gap-4">
                            <input
                                type="checkbox"
                                name="active"
                                id="active"
                                checked={formData.active}
                                onChange={handleChange}
                                className="w-6 h-6 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="active" className="text-sm font-semibold text-gray-700">
                                Plan is Active
                            </label>
                        </div>

                        {/* Description - Full Width */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="5"
                                placeholder="Describe what this plan includes for users..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="md:col-span-2 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105"
                            >
                                {loading
                                    ? "Saving..."
                                    : editingPlan
                                        ? "Update Plan"
                                        : "Create Plan"}
                            </button>

                            {editingPlan && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* All Plans List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* HEADER */}
                <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-8 py-6 flex justify-between items-center">
                    <h3 className="text-3xl font-bold text-white">
                        All Advisor & Developer Plans
                    </h3>

                    <button
                        onClick={fetchPlans}
                        className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition flex items-center gap-2"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-8">
                    {fetchLoading ? (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500">Loading plans...</p>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl">
                            <p className="text-2xl text-gray-500">No plans found</p>
                            <p className="text-gray-400 mt-4">
                                Create your first Advisor or Developer plan above
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {plans.map((plan) => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Advisordeveloper;