// src/redux/slices/subscriptionPlansSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://hotel-banquet.nearprop.in/api/subscriptions";
const token = localStorage.getItem("token")

// ✅ Fetch all plans
export const fetchPlans = createAsyncThunk("plans/fetchPlans", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${BASE_URL}/plans`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Error fetching plans");
  }
});

// ✅ Add new plan
export const addPlan = createAsyncThunk("plans/addPlan", async (planData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${BASE_URL}/plans`, planData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Error adding plan");
  }
});

// ✅ Update plan
export const updatePlan = createAsyncThunk("plans/updatePlan", async ({ planId, planData }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${BASE_URL}/plans/${planId}`, planData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Error updating plan");
  }
});

// ✅ Delete plan
export const deletePlan = createAsyncThunk("plans/deletePlan", async (planId, { rejectWithValue }) => {
  try {
    await axios.delete(`${BASE_URL}/plans/${planId}`);
    return planId;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Error deleting plan");
  }
});


const hotelsPlansSlice = createSlice({
  name: "hotelsPlans",
  initialState: {
    plans: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addPlan.fulfilled, (state, action) => {
        state.plans.push(action.payload);
      })

      // Update
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.plans = state.plans.map((plan) =>
          plan._id === action.payload._id ? action.payload : plan
        );
      })

      // Delete
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((plan) => plan._id !== action.payload);
      });
  },
});

export default hotelsPlansSlice.reducer;
