// src/redux/slices/reelsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseurl = "https://api.nearprop.com/api/reels";

// ------------------ Async Thunks ------------------ //
const token = localStorage.getItem('token')


// Get nearby reels
export const fetchNearbyReels = createAsyncThunk(
  "reels/fetchNearbyReels",
  async ({ radiusKm, latitude, longitude }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // ✅ read inside thunk

      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const url = `${baseurl}/feed/nearby?radiusKm=${radiusKm}&latitude=${latitude}&longitude=${longitude}`;
      console.log("Fetching nearby reels:", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Nearby reels response:", response.data);

      // ✅ adjust return based on actual API
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error fetching nearby reels:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get reels by property
export const fetchPropertyReels = createAsyncThunk(
  "reels/fetchPropertyReels",
  async ({ propertyId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
    
      const response = await axios.get(
        `${baseurl}/property/${propertyId}?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get comments of a reel
export const fetchReelComments = createAsyncThunk(
  "reels/fetchReelComments",
  async ({ reelId, page = 0, size = 20 }, { rejectWithValue }) => {
    try {
    
      const response = await axios.get(
        `${baseurl}/${reelId}/comments?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Like a reel
export const likeReel = createAsyncThunk(
  "reels/likeReel",
  async (reelId, { rejectWithValue }) => {
    try {
    
      const response = await axios.post(
        `${baseurl}/${reelId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { reelId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Unlike a reel
export const unlikeReel = createAsyncThunk(
  "reels/unlikeReel",
  async (reelId, { rejectWithValue }) => {
    try {
    
      await axios.delete(`${baseurl}/${reelId}/like`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return reelId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a reel
export const deleteReel = createAsyncThunk(
  "reels/deleteReel",
  async (reelId, { rejectWithValue }) => {
    try {
    
      await axios.delete(`${baseurl}/${reelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return reelId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ------------------ Slice ------------------ //
const reelsSlice = createSlice({
  name: "reels",
  initialState: {
    reels: [],
    comments: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch nearby reels
      .addCase(fetchNearbyReels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNearbyReels.fulfilled, (state, action) => {
        state.loading = false;
        state.reels = action.payload;
      })
      .addCase(fetchNearbyReels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch property reels
      .addCase(fetchPropertyReels.fulfilled, (state, action) => {
        state.reels = action.payload;
      })

      // Fetch reel comments
      .addCase(fetchReelComments.fulfilled, (state, action) => {
        const { reelId } = action.meta.arg;
        state.comments[reelId] = action.payload;
      })

      // Like a reel
      .addCase(likeReel.fulfilled, (state, action) => {
        const { reelId } = action.payload;
        const reel = state.reels.find((r) => r.id === reelId);
        if (reel) reel.liked = true;
      })

      // Unlike a reel
      .addCase(unlikeReel.fulfilled, (state, action) => {
        const reelId = action.payload;
        const reel = state.reels.find((r) => r.id === reelId);
        if (reel) reel.liked = false;
      })

      // Delete a reel
      .addCase(deleteReel.fulfilled, (state, action) => {
        state.reels = state.reels.filter((r) => r.id !== action.payload);
      });
  },
});

export default reelsSlice.reducer;
