import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { toastError, toastSuccess } from '../../utils/toast';

export const fetchAdvertisements = createAsyncThunk(
  'ads/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/api/v1/advertisements');
      return res.data.content;
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      toastError('Failed to load advertisements');
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch advertisements');
    }
  }
);

export const fetchAdById = createAsyncThunk(
  'ads/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/v1/advertisements/${id}`);
      return res.data;
    } catch (err) {
      console.error('Error fetching ad by ID:', err);
      toastError('Failed to load advertisement');
      return rejectWithValue(err.response?.data?.message || 'Fetch by ID failed');
    }
  }
);
// Create Advertisement
export const createAdvertisement = createAsyncThunk(
  'ads/create',
  async (formData, { rejectWithValue }) => {
    try {
      console.log('📤 Creating Ad with data:', Object.fromEntries(formData));
      // ✅ No headers override (Axios auto sets multipart boundaries)
      const res = await axiosInstance.post('/api/v1/advertisements', formData);
      toastSuccess('Advertisement created successfully');
      return res.data;
    } catch (err) {
      console.error('❌ Error creating advertisement:', err.response?.data || err.message);
      toastError('Failed to create advertisement');
      return rejectWithValue(err.response?.data?.message || 'Creation failed');
    }
  }
);

// Update Advertisement
export const updateAdvertisement = createAsyncThunk(
  'ads/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      console.log('📤 Updating Ad with data:', Object.fromEntries(formData));
      const res = await axiosInstance.put(`/api/v1/advertisements/${id}`, formData);
      toastSuccess('Advertisement updated successfully');
      return res.data;
    } catch (err) {
      console.error('❌ Error updating advertisement:', err.response?.data || err.message);
      toastError('Failed to update advertisement');
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);


export const deleteAdvertisement = createAsyncThunk(
  'ads/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/advertisements/${id}`);
      toastSuccess('Advertisement deleted');
      console.log('Deleted Ad ID:', id);
      return id;
    } catch (err) {
      console.error('Error deleting advertisement:', err);
      toastError('Failed to delete advertisement');
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

const advertisementSlice = createSlice({
  name: 'advertisements',
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedAd: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAdvertisements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdvertisements.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single
      .addCase(fetchAdById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(fetchAdById.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Create
      .addCase(createAdvertisement.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(createAdvertisement.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update
      .addCase(updateAdvertisement.fulfilled, (state, action) => {
        state.list = state.list.map((ad) =>
          ad.id === action.payload.id ? action.payload : ad
        );
      })
      .addCase(updateAdvertisement.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAdvertisement.fulfilled, (state, action) => {
        state.list = state.list.filter((ad) => ad.id !== action.payload);
      })
      .addCase(deleteAdvertisement.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSelectedAd } = advertisementSlice.actions;
export default advertisementSlice.reducer;
