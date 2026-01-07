import React, { useState } from "react";
import axios from "axios";
import Allplans from "./Allplans";
import { toastSuccess, toastError } from "../../utils/toast";

const HotelPlansPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    planType: "monthly",
    planFor: "hotel",
    price: "",
    roomLimit: "",
    reelsLimit: "",
    durationInDays: "",
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
      planType: "monthly",
      planFor: "hotel",
      price: "",
      roomLimit: "",
      reelsLimit: "",
      durationInDays: "",
      description: "",
      isActive: true,
    });
    setEditingPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("subAdminToken");

      if (!token) {
        toastError("Authentication token missing. Please log in again.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        planType: formData.planType,
        planFor: formData.planFor,
        price: Number(formData.price),
        reelsLimit: Number(formData.reelsLimit || 0),
        durationInDays: Number(formData.durationInDays),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      if (formData.planFor === "hotel") {
        payload.roomLimit = Number(formData.roomLimit || 0);
      }

      if (editingPlan) {
        // Update Plan
        await axios.put(
          `https://hotel-banquet.nearprop.in/api/subscriptions/plans/${editingPlan._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toastSuccess("Plan updated successfully!");
      } else {
        // Create Plan
        await axios.post(
          "https://hotel-banquet.nearprop.in/api/subscriptions/plans/",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toastSuccess("Plan created successfully!");
      }

      resetForm();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving plan:", error);
      const msg =
        error.response?.data?.message ||
        Object.values(error.response?.data || {})
          .flat()
          .join(", ") ||
        (editingPlan ? "Failed to update plan" : "Failed to create plan");
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || "",
      planType: plan.planType || "monthly",
      planFor: plan.planFor || "hotel",
      price: plan.price?.toString() || "",
      roomLimit: plan.roomLimit?.toString() || "",
      reelsLimit: plan.reelsLimit?.toString() || "",
      durationInDays: plan.durationInDays?.toString() || "",
      description: plan.description || "",
      isActive: plan.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (planId, planName) => {
    if (!window.confirm(`Delete "${planName}" permanently? This cannot be undone.`)) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("subAdminToken");

      await axios.delete(
        `https://hotel-banquet.nearprop.in/api/subscriptions/plans/${planId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toastSuccess("Plan deleted successfully!");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toastError("Failed to delete plan.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* ==================== CREATE / EDIT FORM ==================== */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <h2 className="text-3xl font-bold text-white">
            {editingPlan ? "✏️ Edit Subscription Plan" : "➕ Create New Plan"}
          </h2>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-7">
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
                placeholder="e.g., Gold Monthly"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Plan For */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Plan Category <span className="text-red-500">*</span>
              </label>
              <select
                name="planFor"
                value={formData.planFor}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="hotel">Hotel</option>
                <option value="banquet">Banquet</option>
              </select>
            </div>

            {/* Plan Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Plan Type <span className="text-red-500">*</span>
              </label>
              <select
                name="planType"
                value={formData.planType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half Yearly</option>
                <option value="yearly">Yearly</option>
                <option value="3_years">3 Years</option>
              </select>
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
                placeholder="1999"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Room Limit - Only for Hotel */}
            {formData.planFor === "hotel" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Limit
                </label>
                <input
                  type="number"
                  name="roomLimit"
                  value={formData.roomLimit}
                  onChange={handleChange}
                  min="0"
                  placeholder="50 (0 = unlimited)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            )}

            {/* Reels Limit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reels Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="reelsLimit"
                value={formData.reelsLimit}
                onChange={handleChange}
                required
                min="0"
                placeholder="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="durationInDays"
                value={formData.durationInDays}
                onChange={handleChange}
                required
                min="1"
                placeholder="30"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                Plan is Active
              </label>
            </div>

            {/* Description - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Highlight key features and benefits..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105 disabled:scale-100"
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

      {/* ==================== ALL PLANS LIST ==================== */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
          <h3 className="text-2xl font-bold text-white">All Subscription Plans</h3>
        </div>
        <div className="p-2">
          <Allplans
            key={refreshKey}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default HotelPlansPage;