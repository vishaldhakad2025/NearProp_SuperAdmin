import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchWithdrawalRequests = createAsyncThunk(
  'franchiseeWithdrawal/fetchRequests',
  async ({ status, page, size, search }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size });
      if (search) params.append('search', search);
      const url = `/api/franchisee/withdrawal/admin/status/${status}?${params.toString()}`;
      const response = await axiosInstance.get(url);
      return { status, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchWithdrawalReport = createAsyncThunk(
  'franchiseeWithdrawal/fetchReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/franchisee/withdrawal/admin/report');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const approveWithdrawalRequest = createAsyncThunk(
  'franchiseeWithdrawal/approveRequest',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/franchisee/withdrawal/admin/process/${id}`, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const rejectWithdrawalRequest = createAsyncThunk(
  'franchiseeWithdrawal/rejectRequest',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/franchisee/withdrawal/admin/process/${id}`, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const franchiseeWithdrawalSlice = createSlice({
  name: 'franchiseeWithdrawal',
  initialState: {
    pending: { content: [], totalPages: 0, totalElements: 0 },
    approved: { content: [], totalPages: 0, totalElements: 0 },
    rejected: { content: [], totalPages: 0, totalElements: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWithdrawalRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawalRequests.fulfilled, (state, action) => {
        state.loading = false;
        const { status, data } = action.payload;
        state[status.toLowerCase()] = {
          content: data.content || data,
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || data.length,
        };
      })
      .addCase(fetchWithdrawalRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch withdrawal requests';
      })
      .addCase(fetchWithdrawalReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawalReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchWithdrawalReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch withdrawal report';
      })
      .addCase(approveWithdrawalRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveWithdrawalRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveWithdrawalRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to approve withdrawal request';
      })
      .addCase(rejectWithdrawalRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectWithdrawalRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rejectWithdrawalRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to reject withdrawal request';
      });
  },
});

export const { clearError } = franchiseeWithdrawalSlice.actions;
export default franchiseeWithdrawalSlice.reducer;