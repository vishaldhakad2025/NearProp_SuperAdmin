import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { toastError, toastSuccess } from "../../utils/toast";

const apiPrefix = "/api";

// ✅ Get All Subscription Plans
export const getAllSubscriptionPlans = createAsyncThunk(
  "subscriptionPlans/getAll",
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/admin/subscription-plans/all`, {
        params: {
          page,
          size,
        },
      });

      return res.data.data; // ✅ backend response data
    } catch (err) {
      toastError("Failed to load plans.");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Get Single Plan
export const getSingleSubscriptionPlan = createAsyncThunk(
  "subscriptionPlans/getOne",
  async (planId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `${apiPrefix}/admin/subscription-plans/${planId}`
      );
      return res.data.data;
    } catch (err) {
      toastError("Failed to fetch plan.");
      console.error("err", err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Create Plan
export const createSubscriptionPlan = createAsyncThunk(
  "subscriptionPlans/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${apiPrefix}/admin/subscription-plans`,
        payload
      );
      toastSuccess("Plan created successfully.");
      return res.data;
    } catch (err) {
      console.error("error", err);
      toastError("Failed to create plan.");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Update Plan
export const updateSubscriptionPlan = createAsyncThunk(
  "subscriptionPlans/update",
  async ({ planId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `${apiPrefix}/admin/subscription-plans/${planId}`,
        data
      );
      toastSuccess("Plan updated successfully.");
      return res.data;
    } catch (err) {
      console.error("error", err);
      toastError("Failed to update plan.");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Activate/Deactivate Plan
// ✅ Activate/Deactivate Plan - IMPROVED ERROR HANDLING
export const toggleSubscriptionPlanStatus = createAsyncThunk(
  "subscriptionPlans/toggleStatus",
  async ({ planId, active }, { rejectWithValue }) => {
    try {
      const actionPath = active ? "deactivate" : "activate";
      const res = await axiosInstance.put(
        `${apiPrefix}/admin/subscription-plans/${planId}/${actionPath}`
      );

      toastSuccess(
        `Plan ${active ? "deactivated" : "activated"} successfully.`
      );
      return { planId, active: !active };
    } catch (err) {
      // 🔥 Extract the deepest real error message
      let errorMsg = "Failed to update plan status.";

      if (err.response?.data) {
        const data = err.response.data;

        // Case 1: Nested error object like your example
        if (data.error?.message) {
          errorMsg = data.error.message;
        }
        // Case 2: Direct message in root
        else if (data.message) {
          errorMsg = data.message;
        }
        // Case 3: Fallback to generic
        else {
          errorMsg = "An error occurred while updating the plan.";
        }
      } else {
        errorMsg = err.message || errorMsg;
      }

      // Show the real backend message in toast
      toastError(errorMsg);

      // Pass structured error for frontend handling (e.g., Swal)
      return rejectWithValue({
        message: errorMsg,
        raw: err.response?.data, // optional: full response for debugging
      });
    }
  }
);

// ✅ Delete Plan
export const deleteSubscriptionPlan = createAsyncThunk(
  "subscriptionPlans/delete",
  async (planId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `${apiPrefix}/admin/subscription-plans/${planId}`
      );
      console.log(res);
      toastSuccess("Plan deleted successfully.");
      return planId;
    } catch (err) {
      toastError("Failed to delete plan.");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const subscriptionPlanSlice = createSlice({
  name: "subscriptionPlans",
  initialState: {
    plans: [],
    singlePlan: null,
    loading: false,
    totalElements: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllSubscriptionPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.content;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(getAllSubscriptionPlans.rejected, (state) => {
        state.loading = false;
      })

      .addCase(getSingleSubscriptionPlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSingleSubscriptionPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.singlePlan = action.payload;
      })
      .addCase(getSingleSubscriptionPlan.rejected, (state) => {
        state.loading = false;
      })

      .addCase(createSubscriptionPlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSubscriptionPlan.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createSubscriptionPlan.rejected, (state) => {
        state.loading = false;
      })

      .addCase(updateSubscriptionPlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSubscriptionPlan.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateSubscriptionPlan.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteSubscriptionPlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
      })

      .addCase(toggleSubscriptionPlanStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleSubscriptionPlanStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.plans.findIndex(
          (plan) => plan.id === action.payload.planId
        );
        if (index !== -1) {
          state.plans[index].active = !state.plans[index].active;
        }
      })
      .addCase(toggleSubscriptionPlanStatus.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default subscriptionPlanSlice.reducer;
