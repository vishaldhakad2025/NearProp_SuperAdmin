import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const apiPrefix = "api";
// Fetch pending role requests
export const fetchPendingRoleRequests = createAsyncThunk(
  'roleRequests/fetchPending',
  async ({ page = 0, size = 10 }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/${apiPrefix}/v1/roles/requests/pending?page=${page}&size=${size}`);
      console.log("response user request ", res)
      return res.data.data;
    } catch (error) {
      console.error("error", error)
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

// Approve or Reject a request
export const processRoleRequest = createAsyncThunk(
  'roleRequests/process',
  async ({ requestId, status }, thunkAPI) => {
    try {
      const approved = status === 'APPROVED';

      const res = await axiosInstance.post(
        `/${apiPrefix}/v1/roles/requests/${requestId}/process`,
        {
          approved,
          comment: approved ? 'Approved after verification' : 'Rejected after verification',
        }
      );

      console.log("update response role request ", res);
      return { requestId, status, ...res.data };
    } catch (error) {
      console.error("error", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to process request'
      );
    }
  }
);


const roleRequestSlice = createSlice({
  name: 'roleRequests',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingRoleRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRoleRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.content || []; // assuming paginated content
      })
      .addCase(fetchPendingRoleRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(processRoleRequest.fulfilled, (state, action) => {
        state.list = state.list.filter((req) => req.id !== action.payload.requestId);
      });

  },
});

export default roleRequestSlice.reducer;
