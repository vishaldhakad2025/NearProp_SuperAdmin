// src/features/subAdmin/subAdminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE ='https://api.nearprop.com';

// Thunks
export const createSubAdmin = createAsyncThunk(
  'subAdmin/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE}/api/subAdmin/create`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const assignPermissions = createAsyncThunk(
  'subAdmin/assignPermissions',
  async ({ subAdminId, modulePermissions }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/admin/permissions/assign`,
        { subAdminId, modulePermissions },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchSubAdmins = createAsyncThunk(
  'subAdmin/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/permissions/subadmins`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchSubAdminPermissions = createAsyncThunk(
  'subAdmin/fetchPermissions',
  async (subAdminId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/permissions/${subAdminId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return { subAdminId, permissions: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updatePermissions = createAsyncThunk(
  'subAdmin/updatePermissions',
  async ({ id, module, actions }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/admin/permissions/${id}`,
        { subAdminId: id, module, actions },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteSubAdmin = createAsyncThunk(
  'subAdmin/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/permissions/${id}/delete-subadmin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Slice
const subAdminSlice = createSlice({
  name: 'subAdmin',
  initialState: {
    list: [],
    loading: false,
    creating: false,
    permissions: {},
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createSubAdmin.pending, (state) => { state.creating = true; })
      .addCase(createSubAdmin.fulfilled, (state, action) => {
        state.creating = false;
        state.list.push(action.payload);
      })
      .addCase(createSubAdmin.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Fetch All
      .addCase(fetchSubAdmins.pending, (state) => { state.loading = true; })
      .addCase(fetchSubAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSubAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Permissions
      .addCase(fetchSubAdminPermissions.fulfilled, (state, action) => {
        state.permissions[action.payload.subAdminId] = action.payload.permissions;
      })

      // Delete
      .addCase(deleteSubAdmin.fulfilled, (state, action) => {
        state.list = state.list.filter((sa) => sa.id !== action.payload);
      });
  },
});

export const { clearError } = subAdminSlice.actions;
export default subAdminSlice.reducer;