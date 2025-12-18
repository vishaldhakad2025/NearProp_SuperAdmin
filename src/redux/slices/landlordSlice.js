// src/redux/slices/landlordSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "https://pg-hostel.nearprop.com/api/admin"; // replace with actual base url

// 1. Get landlord stats
export const getLandlordStats = createAsyncThunk(
  "landlords/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/landlords/stats`);
      console.log("Landlord Stats:", data);
      return data.stats;
    } catch (error) {
      console.error("Error fetching landlord stats:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 2. Get all landlords (paginated, with search)
export const getLandlords = createAsyncThunk(
  "landlords/getAll",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_BASE}/landlords?page=${page}&limit=${limit}&search=${search}`
      );
      console.log("Landlords List:", data);
      return data;
    } catch (error) {
      console.error("Error fetching landlords:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 3. Get single landlord by ID
export const getLandlordById = createAsyncThunk(
  "landlords/getById",
  async (landlordId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/landlords/${landlordId}`);
      console.log("Landlord Details:", data);
      return data.landlord;
    } catch (error) {
      console.error("Error fetching landlord by ID:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// 4. Get properties (all or by landlord, with optional category filter)
export const getProperties = createAsyncThunk(
  "properties/getAll",
  async ({ page = 1, limit = 10, landlordId = "", search = "", category = "" }, { rejectWithValue }) => {
    try {
      let url = `${API_BASE}/properties?page=${page}&landlordId=${landlordId}&limit=${limit}&search=${search}`;
      if (landlordId) url += `&landlordId=${landlordId}`;
      if (category) url += `&category=${category}`;
      const { data } = await axios.get(url);
      console.log("Properties List:", data);
      return data;
    } catch (error) {
      console.error("Error fetching properties:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 5. Get single property details
export const getPropertyById = createAsyncThunk(
  "properties/getById",
  async (propertyId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/properties/${propertyId}`);
      console.log("Property Details:", data);
      return data.property;
    } catch (error) {
      console.error("Error fetching property by ID:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const landlordSlice = createSlice({
  name: "landlords",
  initialState: {
    stats: null,
    landlords: [],
    landlordDetails: null,
    properties: [],
    propertyDetails: null,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearLandlordDetails: (state) => {
      state.landlordDetails = null;
    },
    clearPropertyDetails: (state) => {
      state.propertyDetails = null;
    },
  },
  extraReducers: (builder) => {
    // Stats
    builder
      .addCase(getLandlordStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLandlordStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getLandlordStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Landlords
    builder
      .addCase(getLandlords.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLandlords.fulfilled, (state, action) => {
        state.loading = false;
        state.landlords = action.payload.landlords;
        state.pagination = action.payload.pagination;
      })
      .addCase(getLandlords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Landlord by ID
    builder
      .addCase(getLandlordById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLandlordById.fulfilled, (state, action) => {
        state.loading = false;
        state.landlordDetails = action.payload;
      })
      .addCase(getLandlordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Properties
    builder
      .addCase(getProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties;
        state.pagination = action.payload.pagination;
      })
      .addCase(getProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Property by ID
    builder
      .addCase(getPropertyById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyDetails = action.payload;
      })
      .addCase(getPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLandlordDetails, clearPropertyDetails } = landlordSlice.actions;
export default landlordSlice.reducer;