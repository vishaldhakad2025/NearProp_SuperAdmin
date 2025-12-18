import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// ✅ Fetch franchisee requests with pagination + filters
export const fetchFranchiseeRequests = createAsyncThunk(
  'franchisee/fetchRequests',
  async (
    { page, size, sortBy = 'createdAt', direction = 'DESC', search, status, districtId },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        size,
        sortBy,
        direction,
        ...(search && { search }),
        ...(status && { status }),
      });

      const url = `/api/franchisee/district-assignments?${params.toString()}`;
      const response = await axiosInstance.get(url);

      // ✅ Always filter TERMINATED
      let data = districtId
        ? { content: response.data, totalPages: 1, totalElements: response.data.length }
        : response.data;

      if (data?.content) {
        data.content = data.content.filter((item) => item.status !== "TERMINATED");
        data.totalElements = data.content.length;
      } else if (Array.isArray(data)) {
        data = data.filter((item) => item.status !== "TERMINATED");
        
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ NEW API: fetch requests by status
export const fetchFranchiseeRequestsByStatus = createAsyncThunk(
  'franchisee/fetchRequestsByStatus',
  async ({ status, page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size, sortBy, direction });
      const url = `/api/franchisee/requests/status/${status}?${params.toString()}`;
      const response = await axiosInstance.get(url);
      return { status, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchFranchiseeStatistics = createAsyncThunk(
  'franchisee/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/franchisee/requests/statistics');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchFranchiseeByDistrict = createAsyncThunk(
  'franchisee/fetchByDistrict',
  async (districtId, { rejectWithValue }) => {
    try {
      const url = districtId ? `/api/franchisee/requests/district/${districtId}` : '/api/franchisee/reports/admin/all';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchFranchiseeReport = createAsyncThunk(
  'franchisee/fetchReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/franchisee/reports/admin/all');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const approveFranchiseeRequest = createAsyncThunk(
  'franchisee/approveRequest',
  async ({ id, comments, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ comments });
      if (endDate) params.append('endDate', endDate);
      const response = await axiosInstance.put(`/api/franchisee/requests/${id}/approve?${params.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const rejectFranchiseeRequest = createAsyncThunk(
  'franchisee/rejectRequest',
  async ({ id, comments }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ comments });
      const response = await axiosInstance.put(`/api/franchisee/requests/${id}/reject?${params.toString()}`);
      return response.data;
    } catch (err) {
      console.error(err)
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const terminateFranchiseeRequest = createAsyncThunk(
  'franchisee/terminateRequest',
  async ({ id, comments }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ comments });
      const response = await axiosInstance.put(`/api/franchisee/requests/${id}/terminate?Contractterminated`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ DELETE franchisee
export const deleteFranchisee = createAsyncThunk(
  'franchisee/deleteFranchisee',
  async ({ id, reason = 'deleted',districtId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ reason });
      console.log(params)
      const response = await axiosInstance.delete(`/api/admin/franchisee/${id}?${params.toString()}/${districtId}`);
      return { id, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const franchiseeSlice = createSlice({
  name: 'franchisee',
  initialState: {
    requests: [],
    pendingRequests: [],
    statistics: { PENDING: 0, APPROVED: 0, REJECTED: 0, TERMINATED: 0 },
    totalPages: 0,
    totalElements: 0,
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
      // ✅ Normal fetch requests
      .addCase(fetchFranchiseeRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFranchiseeRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.content || [];
        state.totalPages = action.payload.totalPages || 0;
        state.totalElements = action.payload.totalElements || 0;
      })
      .addCase(fetchFranchiseeRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch franchisee requests';
      })

      // ✅ Fetch by status
      .addCase(fetchFranchiseeRequestsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFranchiseeRequestsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 'PENDING') {
          state.pendingRequests = action.payload.content || [];
        }
        state.requests = action.payload.content || [];
        state.totalPages = action.payload.totalPages || 0;
        state.totalElements = action.payload.totalElements || 0;
      })
      .addCase(fetchFranchiseeRequestsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch franchisee requests by status';
      })

      // ✅ Statistics
      .addCase(fetchFranchiseeStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFranchiseeStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchFranchiseeStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch statistics';
      })

      // ✅ Other requests
      .addCase(fetchFranchiseeByDistrict.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchFranchiseeByDistrict.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Delete franchisee
      .addCase(deleteFranchisee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFranchisee.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter((req) => req.id !== action.payload.id);
      })
      .addCase(deleteFranchisee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete franchisee';
      });
  },
});

export const { clearError } = franchiseeSlice.actions;
export default franchiseeSlice.reducer;
