import React, { useState, useEffect } from 'react';
import { toastError, toastSuccess, toastWarning } from '../../utils/toast';

function Allpghostelplans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [viewingPlan, setViewingPlan] = useState(null);
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

    const fetchPlans = () => {
        setLoading(true);
        fetch('https://pg-hostel.nearprop.com/api/subscription-plans/list/all')
            .then(res => res.json())
            .then(data => {
                setPlans(data.plans || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name || "",
            price: plan.price || "",
            currency: plan.currency || "INR",
            billing_cycle: plan.billing_cycle || "monthly",
            duration_days: plan.duration_days || "",
            property_limit: plan.property_limit || "",
            reel_limit: plan.reel_limit || "",
            features: plan.features ? plan.features.join(", ") : "",
            is_active: plan.is_active || true,
        });
        setIsEditModalOpen(true);
    };

    const handleView = (plan) => {
        setViewingPlan(plan);
        setIsViewModalOpen(true);
    };

    const handleDelete = async (planId) => {
        if (!window.confirm('Are you sure you want to delete this subscription plan? This action cannot be undone.')) {
            return;
        }

        try {
            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("subAdminToken");

            if (!token) return toastWarning("Admin token missing");

            const res = await fetch(
                `https://pg-hostel.nearprop.com/api/subscription-plans/${planId}/`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");

            toastSuccess("Subscription Plan Deleted Successfully ✅");
            fetchPlans();

        } catch (error) {
            toastWarning(error.message || "Error deleting plan");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingPlan) return;

        try {
            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("subAdminToken");

            if (!token) return toastWarning("Admin token missing");

            const payload = {
                name: formData.name,
                price: Number(formData.price),
                currency: formData.currency,
                billing_cycle: formData.billing_cycle,
                duration_days: Number(formData.duration_days),
                property_limit: Number(formData.property_limit),
                reel_limit: Number(formData.reel_limit),
                features: formData.features.split(",").map(f => f.trim()).filter(f => f),
                is_active: formData.is_active,
            };

            const res = await fetch(
                `https://pg-hostel.nearprop.com/api/subscription-plans/${editingPlan._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");

            toastSuccess("Subscription Plan Updated Successfully ✅");
            setIsEditModalOpen(false);
            setEditingPlan(null);
            fetchPlans();

        } catch (error) {
            toastError(error.message || "Error updating plan");
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingPlan(null);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewingPlan(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-lg text-gray-600">Loading plans...</div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-100 p-4 pt-8">
                <div className="w-full">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">
                        PG and Hostel Subscription Plans
                    </h1>
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {plans.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No subscription plans available.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Cycle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Limit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reel Limit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {plans.map((plan) => (
                                            <tr key={plan._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.price}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.currency}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.billing_cycle}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.duration_days} days</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.property_limit}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.reel_limit || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {plan.features.map((feature, index) => (
                                                            <li key={index}>{feature}</li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plan.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {plan.is_active ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(plan.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => handleView(plan)}
                                                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded-md border border-blue-300 hover:bg-blue-50 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(plan)}
                                                        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded-md border border-indigo-300 hover:bg-indigo-50 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(plan._id)}
                                                        className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md border border-red-300 hover:bg-red-50 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* View Modal */}
            {isViewModalOpen && viewingPlan && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={closeViewModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">View Subscription Plan</h2>

                        <div className="space-y-6">
                            {/* Grid Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                                    <p className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">{viewingPlan.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                    <p className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">{viewingPlan.price}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <p className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">{viewingPlan.currency}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
                                    <p className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">{viewingPlan.billing_cycle}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
                                    <p className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">{viewingPlan.duration_days}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Limit</label>
                                    <p className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">{viewingPlan.property_limit}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reel Limit</label>
                                    <p className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">{viewingPlan.reel_limit || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                                <ul className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 space-y-1">
                                    {viewingPlan.features.map((feature, index) => (
                                        <li key={index} className="text-gray-900">• {feature}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Active */}
                            <div className="flex items-center gap-3">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${viewingPlan.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {viewingPlan.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={closeViewModal}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={closeEditModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Subscription Plan</h2>

                        <form onSubmit={handleUpdateSubmit} className="space-y-6">
                            {/* Grid Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                    <input
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                    >
                                        <option value="INR">INR</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
                                    <select
                                        name="billing_cycle"
                                        value={formData.billing_cycle}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                        required
                                    >
                                        <option value="monthly">monthly</option>
                                        <option value="quarterly">quarterly</option>
                                        <option value="yearly">yearly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
                                    <input
                                        name="duration_days"
                                        type="number"
                                        min="1"
                                        value={formData.duration_days}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Limit</label>
                                    <input
                                        name="property_limit"
                                        type="number"
                                        min="1"
                                        value={formData.property_limit}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reel Limit</label>
                                    <input
                                        name="reel_limit"
                                        type="number"
                                        min="0"
                                        value={formData.reel_limit}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma separated)</label>
                                <textarea
                                    name="features"
                                    value={formData.features}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-vertical"
                                />
                            </div>

                            {/* Active Checkbox */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Plan Active</span>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Update Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </>
    );
}

export default Allpghostelplans;