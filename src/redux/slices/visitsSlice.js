// redux/slices/visitsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import axios from "axios";


export const fetchVisits = createAsyncThunk(
  "visits/fetchVisits",
  async ({ status = "PENDING", page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://api.nearprop.com/api/visits/admin/by-status?status=${status}&page=${page}&size=${size}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // console.log("✅ fetchVisits response:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ fetchVisits error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


/**
 * 🔹 Fetch visit by ID
 */
export const fetchVisitById = createAsyncThunk(
  "visits/fetchVisitById",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/visits/${id}`);
      console.log("✅ fetchVisitById response:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ fetchVisitById error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/**
 * 🔹 Update visit status
 */
export const updateVisitStatus = createAsyncThunk(
  "visits/updateVisitStatus",
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/visits/${id}/status`, {
        status,
        notes,
      });
      console.log("✅ updateVisitStatus response:", res.data);
      return { id, status, notes };
    } catch (err) {
      console.error("❌ updateVisitStatus error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const visitsSlice = createSlice({
  name: "visits",
  initialState: {
    visits: [],
    totalPages: 0,
    totalElements: 0,
    loading: false,
    error: null,
    selectedVisit: null,
  },
  reducers: {
    clearSelectedVisit: (state) => {
      state.selectedVisit = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ fetchVisits
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.loading = false;

        // Ensure data exists
        const visits = action.payload.content || [];

        // Sort visits by scheduledTime DESC (latest first)
        state.visits = visits.sort(
          (a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime)
        );

        state.totalPages = action.payload.totalPages || 0;
        state.totalElements = action.payload.totalElements || 0;
      })


      // ✅ fetchVisitById
      .addCase(fetchVisitById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisitById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVisit = action.payload;
      })
      .addCase(fetchVisitById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ updateVisitStatus
      .addCase(updateVisitStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVisitStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, status, notes } = action.payload;
        const idx = state.visits.findIndex((v) => v.id === id);
        if (idx !== -1) {
          state.visits[idx] = { ...state.visits[idx], status, notes };
        }
        if (state.selectedVisit?.id === id) {
          state.selectedVisit = { ...state.selectedVisit, status, notes };
        }
      })
      .addCase(updateVisitStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedVisit } = visitsSlice.actions;
export default visitsSlice.reducer;
