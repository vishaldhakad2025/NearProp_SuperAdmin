import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async ({ page, size, search, role }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size });
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      const url = `/api/v1/admin/users?${params.toString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState: {
    users: [],
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
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || [];
        state.totalPages = action.payload.totalPages || 1;
        state.totalElements = action.payload.totalElements || action.payload.data.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      });
  },
});

export const { clearError } = userManagementSlice.actions;
export default userManagementSlice.reducer;