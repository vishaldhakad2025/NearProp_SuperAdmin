import React, { useState } from "react";
import Allpghostelplans from "./Allpghostelplans";
import { toastSuccess, toastWarning } from "../../utils/toast";

function Allpghostels() {
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        currency: "INR",
        billing_cycle: "monthly",
        duration_days: "",
        property_limit: "",
        reel_limit: "",
        features: "",
        is_active: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const payload = {
                ...formData,
                price: Number(formData.price),
                duration_days: Number(formData.duration_days),
                property_limit: Number(formData.property_limit),
                reel_limit: Number(formData.reel_limit),
                features: formData.features.split(",").map(f => f.trim()),
            };

            const res = await fetch(
                "https://pg-hostel.nearprop.com/api/subscription-plans/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toastSuccess("Subscription Plan Created Successfully ✅");

        } catch (error) {
            toastWarning("Failed to creating plan, Try again later");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 pt-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">
                    PG and Hostel Subscriptions
                </h1>
                <div className="w-full  bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Create Subscription Plan
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Grid Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Plan Name
                                </label>
                                <input
                                    name="name"
                                    placeholder="Enter a plan name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Price
                                </label>
                                <input
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Currency
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="INR">INR</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Billing Cycle
                                </label>
                                <select
                                    name="billing_cycle"
                                    value={formData.billing_cycle}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                >
                                    <option value="monthly">monthly</option>
                                    <option value="quarterly">quarterly</option>
                                    <option value="yearly">yearly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Duration (Days)
                                </label>
                                <input
                                    name="duration_days"
                                    type="number"
                                    min="1"
                                    placeholder="days"
                                    value={formData.duration_days}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Property Limit
                                </label>
                                <input
                                    name="property_limit"
                                    type="number"
                                    min="1"
                                    placeholder="eg 5"
                                    value={formData.property_limit}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Reel Limit
                                </label>
                                <input
                                    name="reel_limit"
                                    type="number"
                                    min="1"
                                    placeholder="eg 5"
                                    value={formData.reel_limit}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>

                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Features (comma separated)
                            </label>
                            <textarea
                                name="features"
                                placeholder="eg List 5 properties, Priority support, Analytics"
                                value={formData.features}
                                onChange={handleChange}
                                rows="3"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Active Checkbox */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-5 h-5 text-indigo-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Plan Active
                            </span>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                            >
                                Create Plan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div>
                <Allpghostelplans />
            </div>
        </div>
    );
}

export default Allpghostels;