import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";




export const fetchDistrictStats = createAsyncThunk(
  "dashboard/fetchDistrictStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/properties/stats/by-district`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch district stats:", err.message, err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Failed to fetch district stats");
    }
  }
);

export const fetchTypeStats = createAsyncThunk(
  "dashboard/fetchTypeStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/properties/stats/by-type`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch type stats:", err.message, err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Failed to fetch type stats");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    districtStats: {},
    typeStats: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistrictStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistrictStats.fulfilled, (state, action) => {
        state.loading = false;
        state.districtStats = action.payload;
      })
      .addCase(fetchDistrictStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTypeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTypeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.typeStats = action.payload;
      })
      .addCase(fetchTypeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;