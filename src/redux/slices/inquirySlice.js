// src/store/slices/inquirySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

// const BASE_URL = `${process.env.REACT_APP_BASE_URL}/${process.env.REACT_APP_API_PREFIX}`;

// Async thunk to fetch inquiries
export const fetchInquiries = createAsyncThunk('inquiries/fetchInquiries', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/api/inquiries`);
    console.log(response)
    return response.data;
  } catch (error) {
    console.error(error)
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch inquiries');
  }
});

// Async thunk to update inquiry status
export const updateInquiryStatus = createAsyncThunk(
  'inquiries/updateInquiryStatus',
  async ({ inquiryId, status = 'OTHER', comment = 'Inquiry handled and completed by admin.' }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/api/inquiries/${inquiryId}/status`,
        { status, comment }
      );
      toast.success(response?.name ,'successfully');
      console.log(response)
      return { inquiryId, updatedData: response.data };
    } catch (error) {
        console.log("axios error",error)
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to update inquiry');
    }
  }
);

const inquirySlice = createSlice({
  name: 'inquiries',
  initialState: {
    inquiries: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.inquiries = action.payload;
      })
      .addCase(fetchInquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateInquiryStatus.fulfilled, (state, action) => {
        const { inquiryId, updatedData } = action.payload;
        const index = state.inquiries.findIndex((inq) => inq.id === inquiryId);
        if (index !== -1) {
          state.inquiries[index] = { ...state.inquiries[index], ...updatedData };
        }
      })
      .addCase(updateInquiryStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default inquirySlice.reducer;