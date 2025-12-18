import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const baseUrl = "https://hotel-banquet.nearprop.in"; // change this

// ================= HOTEL APIS =================

// Get all owner
export const fetchowner = createAsyncThunk("hotelBanquet/fetchowner", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${baseUrl}/api/auth/owner`);
    console.log("Fetch owner Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fetch owner Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch owner");
    return rejectWithValue(error.response?.data);
  }
});

// Get all hotels
export const fetchHotels = createAsyncThunk("hotelBanquet/fetchHotels", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${baseUrl}/api/hotels`);
    console.log("Fetch Hotels Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fetch Hotels Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch hotels");
    return rejectWithValue(error.response?.data);
  }
});

// Get hotel by ID
export const fetchHotelById = createAsyncThunk("hotelBanquet/fetchHotelById", async (hotelId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${baseUrl}/api/hotels/${hotelId}`);
    console.log("Fetch Hotel by ID Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fetch Hotel by ID Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch hotel");
    return rejectWithValue(error.response?.data);
  }
});


// ================= BANQUET APIS =================

// Get all banquets
export const fetchBanquets = createAsyncThunk("hotelBanquet/fetchBanquets", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${baseUrl}/api/banquet-halls`);
    console.log("Fetch Banquets Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fetch Banquets Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch banquets");
    return rejectWithValue(error.response?.data);
  }
});

// Get banquet by ID
export const fetchBanquetById = createAsyncThunk("hotelBanquet/fetchBanquetById", async (banquetHallId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${baseUrl}/api/banquet-halls/${banquetHallId}`);
    console.log("Fetch Banquet by ID Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fetch Banquet by ID Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch banquet");
    return rejectWithValue(error.response?.data);
  }
});



// ================= ROOMS APIS =================

// Get rooms by hotel
export const fetchRoomsByHotel = createAsyncThunk("hotelBanquet/fetchRoomsByHotel", async (hotelId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${baseUrl}/api/rooms/hotel/${hotelId}`);
    console.log("Fetch Rooms by Hotel Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fetch Rooms by Hotel Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch rooms");
    return rejectWithValue(error.response?.data);
  }
});

// Get room by ID
export const fetchRoomById = createAsyncThunk("hotelBanquet/fetchRoomById", async (roomId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${baseUrl}/api/rooms/${roomId}`);
    console.log("Fetch Room by ID Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fetch Room by ID Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch room");
    return rejectWithValue(error.response?.data);
  }
});

// ================= REELS APIS =================

// Get reels by hotel
export const fetchHotelReels = createAsyncThunk("hotelBanquet/fetchHotelReels", async (hotelId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${baseUrl}/api/reels/hotel/${hotelId}`);
    console.log("Fetch Hotel Reels Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fetch Hotel Reels Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch reels");
    return rejectWithValue(error.response?.data);
  }
});

// Get reels by banquet
export const fetchBanquetReels = createAsyncThunk("hotelBanquet/fetchBanquetReels", async (banquetHallId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${baseUrl}/api/reels/banquet/${banquetHallId}`);
    console.log("Fetch Banquet Reels Response:", res.data.data);
    return res.data;
  } catch (error) {
    console.error("Fetch Banquet Reels Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch reels");
    return rejectWithValue(error.response?.data);
  }
});

// ================= AVERAGE RATING APIS =================

export const fetchAverageRating = createAsyncThunk("hotelBanquet/fetchAverageRating", async ({ type, id }, { rejectWithValue }) => {
  try {
    let url = "";
    if (type === "room") url = `${baseUrl}/api/review/average?roomId=${id}`;
    if (type === "hotel") url = `${baseUrl}/api/review/average?hotelId=${id}`;
    if (type === "banquet") url = `${baseUrl}/api/review/average?banquetId=${id}`;

    const res = await axios.get(url);
    console.log("Fetch Average Rating Response:", res.data);
    return  res.data;
  } catch (error) {
    console.error("Fetch Average Rating Error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch rating");
    return rejectWithValue(error.response?.data);
  }
});

// ================= SLICE =================
const hotelBanquetSlice = createSlice({
  name: "hotelBanquet",
  initialState: {
    owners: [],
    hotels: [],
    banquets: [],
    rooms: [],
    reels: [],
    hotelDetails: null,
    banquetDetails: null,
    roomDetails: null,
    averageRatings: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
    // Owners
      .addCase(fetchowner.fulfilled, (state, action) => {
        state.owners = action.payload?.data?.owners || []; // ✅ extract owners from API response
      })
      .addCase(fetchHotels.fulfilled, (state, action) => { state.hotels = action.payload; })
      .addCase(fetchHotelById.fulfilled, (state, action) => { state.hotelDetails = action.payload; })
      .addCase(fetchBanquets.fulfilled, (state, action) => { state.banquets = action.payload; })
      .addCase(fetchBanquetById.fulfilled, (state, action) => { state.banquetDetails = action.payload; })
      .addCase(fetchRoomsByHotel.fulfilled, (state, action) => { state.rooms = action.payload; })
      .addCase(fetchRoomById.fulfilled, (state, action) => { state.roomDetails = action.payload; })
      .addCase(fetchHotelReels.fulfilled, (state, action) => { state.reels = action.payload; })
      .addCase(fetchBanquetReels.fulfilled, (state, action) => { state.reels = action.payload; })
      .addCase(fetchAverageRating.fulfilled, (state, action) => {
        const averageRating  = action.payload;
        console.log("Fetch Average Rating:", action.payload);
        state.averageRatings = averageRating;
      });
  },
});

export default hotelBanquetSlice.reducer;
