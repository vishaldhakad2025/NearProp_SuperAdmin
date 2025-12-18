import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { toastError, toastInfo, toastSuccess } from "../../utils/toast";
import axios from "axios";
const apiPrefix = "/api";

// ✅ Fetch All Properties
export const getAllProperties = createAsyncThunk(
  "properties/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/public/properties`
      );
      console.log("properties", res)
      return res.data.data;
    } catch (err) {
      console.error("Error fetching properties:", err);
      // toastError("property");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Get Single Property by ID
export const getPropertyById = createAsyncThunk(
  "properties/getById",
  async (propertyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/properties/${propertyId}`);
      // toastInfo("Property loaded");
      return res.data;
    } catch (err) {
      toastError("Failed to load property");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Approve Property
export const approveProperty = createAsyncThunk(
  "properties/approve",
  async (propertyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`${apiPrefix}/properties/${propertyId}/approve`);
      toastSuccess("Property approved successfully");
      return { id: propertyId, status: "APPROVED" };
    } catch (err) {
      console.error("Approve error:", err);
      toastError("Failed to approve property");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Reject Property
export const rejectProperty = createAsyncThunk(
  "properties/reject",
  async (propertyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`${apiPrefix}/properties/${propertyId}/reject`);
      console.log("Reject res", res)
      toastInfo("Property rejected");
      return { id: propertyId, status: "REJECTED" };
    } catch (err) {
      console.error("Reject error:", err);
      toastError("Failed to reject property");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Toggle Featured
export const toggleFeaturedProperty = createAsyncThunk(
  "properties/toggleFeatured",
  async ({ propertyId, featured }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `${apiPrefix}/properties/${propertyId}/featured?featured=${featured}`
      );
      toastInfo(
        `Property marked as ${featured ? "featured" : "not featured"}`
      );
      console.log("-----------------------------response ", res)
      return { id: propertyId, featured };
    } catch (err) {
      console.error("Toggle featured error:", err);
      toastError("Failed to update featured status");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Get Pending Properties
export const getPendingProperties = createAsyncThunk(
  "properties/getPending",
  async ({ page = 0, size = 10, sortBy = "createdAt", direction = "DESC", search = "" }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/properties/admin/pending`,
        {
          params: {
            page,
            size
          },
        }
      );
      console.log(res)
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// src/redux/slices/propertySlice.js
export const getPropertyStatsByType = createAsyncThunk(
  "properties/getStatsByType",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/properties/stats/by-type`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* API: GET /api/reels/property/?page=0&size=10&sortBy=createdAt&direction=DESC */
/* -------------------------------------------------------------------------- */
export const fetchReelsByProperty = createAsyncThunk(
  "property/fetchReelsByProperty",
  async ({ propertyId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/reels/property/${propertyId}`, {
        params: { page, size, sortBy: "createdAt", direction: "DESC" },
        headers: {

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // 🔎 If backend requires filtering by propertyId, filter manually
      const filteredReels = response.data?.content
      return filteredReels || [];
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.response?.data || "Failed to fetch reels");
    }
  }
);

// ✅ Delete Property
export const deleteProperty = createAsyncThunk(
  "properties/delete",
  async (propertyId, { rejectWithValue }) => {
    try {
      console.log(propertyId)
      const res = await axios.delete(`https://api.nearprop.com/api/properties/admin/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token
        },
      });
      console.log("------delted ", res)
      // Show success message
      toastSuccess("Property deleted successfully");

      return propertyId; // return id so we can remove from state
    } catch (err) {
      console.error("Delete property error:", err);
      toastError("Failed to delete property");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


const propertySlice = createSlice({
  name: "properties",
  initialState: {
    all: [],
    reels: [],
    loading: false,
    selectedProperty: null,
    pendingProperties: null,
    propertyTypeStats: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(getAllProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.all = action.payload;
      })
      .addCase(getAllProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Property By ID
      .addCase(getPropertyById.pending, (state) => {
        state.loading = true;
        state.selectedProperty = null;
      })
      .addCase(getPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProperty = action.payload;
      })
      .addCase(getPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // pendingProperties
      .addCase(getPendingProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPendingProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingProperties = action.payload.content;
        state.pagination = {
          total: action.payload.totalElements,
          current: action.payload.number + 1,
          pageSize: action.payload.size,
        };
      })
      .addCase(getPendingProperties.rejected, (state, action) => {
        state.loading = false;
        toastError(action.payload);
      })

      // propertyTypeStats
      .addCase(getPropertyStatsByType.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPropertyStatsByType.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyTypeStats = action.payload;
      })
      .addCase(getPropertyStatsByType.rejected, (state, action) => {
        state.loading = false;
        toastError(action.payload);
      })

      // Approve
      .addCase(approveProperty.fulfilled, (state, action) => {
        const index = state.all.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.all[index].approved = true;
      })

      // Reject
      .addCase(rejectProperty.fulfilled, (state, action) => {
        const index = state.all.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.all[index].approved = false;
      })

      // Toggle Featured
      .addCase(toggleFeaturedProperty.fulfilled, (state, action) => {
        const index = state.all.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.all[index].featured = action.payload.featured;
      })


      // Delete Property
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.all = state.all.filter((p) => p.id !== action.payload);
        // also remove from pending if it exists there
        if (state.pendingProperties) {
          state.pendingProperties = state.pendingProperties.filter(
            (p) => p.id !== action.payload
          );
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ------------------------------ Reels ----------------------------- */
      .addCase(fetchReelsByProperty.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReelsByProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.reels = action.payload;
      })
      .addCase(fetchReelsByProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default propertySlice.reducer;
