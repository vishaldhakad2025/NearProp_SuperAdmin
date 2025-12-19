// // src/redux/slices/subAdminSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../../utils/axiosInstance';
// const authHeader = () => {
//   const token = localStorage.getItem('subAdminToken') || localStorage.getItem('token');
//   return { Authorization: `Bearer ${token}` };
// };


// /* ==================== 1. CREATE SUB-ADMIN ==================== */
// export const createSubAdmin = createAsyncThunk(
//   'subAdmin/create',
//   async (data, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/api/subAdmin/create', data);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || { message: 'Failed to create sub-admin' });
//     }
//   }
// );

// /* ==================== 2. FETCH ALL SUB-ADMINS + PERMISSIONS (Refresh-Proof) ==================== */
// export const fetchSubAdmins = createAsyncThunk(
//   'subAdmin/fetchAll',
//   async (_, { rejectWithValue, dispatch }) => {
//     try {
//       const res = await axiosInstance.get('/api/admin/permissions/subadmins');
//       const subAdmins = Array.isArray(res.data.data) ? res.data.data : [];

//       // Automatically load permissions for each sub-admin
//       subAdmins.forEach((subAdmin) => {
//         if (subAdmin.id) {
//           dispatch(fetchSubAdminById(subAdmin.id));
//         }
//       });

//       return subAdmins;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || { message: 'Failed to load sub-admins' });
//     }
//   }
// );

// /* ==================== 3. GET PERMISSIONS BY ID ==================== */
// export const fetchSubAdminById = createAsyncThunk(
//   'subAdmin/fetchById',
//   async (subAdminId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/api/admin/permissions/${subAdminId}`);
//       const records = Array.isArray(res.data.data) ? res.data.data : [];
//       const grouped = {};

//       records.forEach((r) => {
//         if (!grouped[r.module]) grouped[r.module] = [];
//         grouped[r.module].push(r.action);
//       });

//       const modulePermissions = Object.entries(grouped).map(([module, actions]) => ({
//         module,
//         actions,
//       }));

//       return { subAdminId, modulePermissions };
//     } catch (err) {
//       return rejectWithValue(err.response?.data || { message: 'Failed to load permissions' });
//     }
//   }
// );

// /* ==================== 4. UPDATE PERMISSIONS ==================== */
// export const updateSubAdminPermissions = createAsyncThunk(
//   'subAdmin/updatePermissions',
//   async ({ subAdminId, modulePermissions }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put('/api/admin/permissions/update', {
//         subAdminId,
//         modulePermissions,
//       });
//       return { subAdminId, modulePermissions, message: res.data.message };
//     } catch (err) {
//       return rejectWithValue(err.response?.data || { message: 'Failed to update permissions' });
//     }
//   }
// );

// /* ==================== 5. DELETE ENTIRE SUB-ADMIN ==================== */
// export const deleteSubAdmin = createAsyncThunk(
//   'subAdmin/delete',
//   async (subAdminId, { rejectWithValue, dispatch }) => {
//     try {
//       const res = await axiosInstance.delete(`/api/admin/permissions/${subAdminId}/delete-subadmin`);
//       dispatch(fetchSubAdmins()); // Refresh list
//       return { subAdminId, message: res.data.message || `SubAdmin deleted successfully with ID: ${subAdminId}` };
//     } catch (err) {
//       return rejectWithValue(err.response?.data || { message: 'Failed to delete sub-admin' });
//     }
//   }
// );

// /* ==================== 6. DELETE SPECIFIC MODULE PERMISSION ==================== */
// export const deleteModulePermission = createAsyncThunk(
//   'subAdmin/deleteModulePermission',
//   async ({ subAdminId, module }, { rejectWithValue, dispatch }) => {
//     try {
//       const res = await axiosInstance.delete(
//         `/api/admin/permissions/${subAdminId}/module/${module}`
//       );
//       // Refetch permissions to update UI
//       dispatch(fetchSubAdminById(subAdminId));
//       return { subAdminId, module, message: res.data.message };
//     } catch (err) {
//       return rejectWithValue(err.response?.data || { message: 'Failed to remove module permission' });
//     }
//   }
// );

// /* ==================== 7. UPDATE MY PROFILE (Optional) ==================== */
// export const updateMyProfile = createAsyncThunk(
//   'subAdmin/updateMyProfile',
//   async (formData, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put('/api/v1/users/profile-update', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       return res.data.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || { message: 'Profile update failed' });
//     }
//   }
// );

// /* ==================== 1. GET ALL ADVERTISEMENTS ==================== */
// // export const fetchAllAdvertisements = createAsyncThunk(
// //   'ads/fetchAll',
// //   async (_, thunkAPI) => {
// //     try {
// //       const res = await axios.get(
// //         `${API_BASE}/api/admin/permissions/allAdvertisement`,
// //         { headers: authHeader() }
// //       );
// //       return res.data;
// //     } catch (error) {
// //       return thunkAPI.rejectWithValue(error.response?.data || error.message);
// //     }
// //   }
// // );

// export const fetchAllAdvertisements = createAsyncThunk(
//   "advertisement/fetchAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const subAdminToken = localStorage.getItem("subAdminToken");

//       const response = await axiosInstance.get("/api/admin/permissions/allAdvertisement", {
//         headers: {
//           Authorization: `Bearer ${subAdminToken}`,
//         },
//       });

//       return response.data; // this is the array of advertisements
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { message: error.message });
//     }
//   }
// );
// /* ==================== 2. GET ADVERTISEMENT BY ID ==================== */
// /* ==================== 2. GET ADVERTISEMENT BY ID ==================== */
// export const fetchAdvertisementById = createAsyncThunk(
//   "subAdmin/fetchAdvertisementById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const subAdminToken = localStorage.getItem("subAdminToken");
//       if (!subAdminToken) {
//         return rejectWithValue({ message: "SubAdmin token not found" });
//       }

//       console.log("Token used for fetchAdvertisementById:", subAdminToken);

//       const response = await axiosInstance.get(
//         `/api/admin/permissions/advertisement/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${subAdminToken}`,
//             Accept: "application/json",
//           },
//         }
//       );

//       return response.data;
//     } catch (err) {
//       console.error(
//         "Error fetching advertisement by ID:",
//         err.response?.data || err.message
//       );
//       return rejectWithValue(
//         err.response?.data || { message: "Failed to fetch advertisement" }
//       );
//     }
//   }
// );

// /* ==================== 3. CREATE ADVERTISEMENT (multipart + headers) ==================== */
// export const createAdvertisement = createAsyncThunk(
//   'advertisement/create',
//   async (formData, { rejectWithValue }) => {
//     try {
//       console.log("Token used:", localStorage.getItem("subAdminToken"));
//       const res = await axiosInstance.post(`/api/admin/permissions`, formData, {
//         headers: {
//           validFrom: formData.get('validFrom'),
//           validTo: formData.get('validUntil'),
//         },
//       });
//       return res.data;
//     } catch (err) {
//       console.error("Advertisement creation error:", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || { message: 'Failed to create advertisement' });
//     }
//   }
// );

// export const fetchFranchiseById = createAsyncThunk(
//   "subAdmin/fetchFranchiseById",
//   async (id, { rejectWithValue }) => {
//     try {

//       console.log("12345678");

//       // Get token from localStorage
//       const subAdminToken = localStorage.getItem("subAdminToken");
//       if (!subAdminToken) {
//         return rejectWithValue({ message: "SubAdmin token not found" });
//       }

//       console.log("Token used for fetchFranchiseById:", subAdminToken);

//       // Make GET request
//       const response = await axiosInstance.get(
//         `/api/admin/permissions/franchisee/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${subAdminToken}`,
//             Accept: "application/json",
//           },
//         }
//       );

//       return response.data; // returns the franchise object
//     } catch (err) {
//       console.log("errororr", err);

//       return rejectWithValue(
//         err.response?.data || { message: "Failed to fetch franchise" }
//       );
//     }
//   }
// );

// /* ==================== 4. DELETE ADVERTISEMENT ==================== */
// export const deleteAdvertisement = createAsyncThunk(
//   "subAdmin/deleteAdvertisementById",
//   async (id, { rejectWithValue }) => {
//     try {
//       // Get token from localStorage
//       const subAdminToken = localStorage.getItem("subAdminToken");
//       if (!subAdminToken) {
//         return rejectWithValue({ message: "SubAdmin token not found" });
//       }

//       console.log("Token used for deleteAdvertisementById:", subAdminToken);

//       // Make DELETE request
//       const response = await axiosInstance.delete(
//         `/api/admin/permissions/advertisement/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${subAdminToken}`,
//             Accept: "application/json",
//           },
//         }
//       );

//       return response.data; // { success: true, message: "Advertisement deleted successfully" }
//     } catch (err) {
//       console.error(
//         "Error deleting advertisement by ID:",
//         err.response?.data || err.message
//       );
//       return rejectWithValue(
//         err.response?.data || { message: "Failed to delete advertisement" }
//       );
//     }
//   }
// );
// /* ==================== SLICE ==================== */
// const subAdminSlice = createSlice({
//   name: 'subAdmin',
//   initialState: {
//     // Sub-admin state
//     list: [],
//     permissions: {},
//     myProfile: null,

//     // Advertisement state
//     advertisements: [],
//     currentAdvertisement: null,

//     // Loading states
//     loading: false,
//     creating: false,
//     updating: false,
//     deleting: false,
//     advLoading: false,
//     advCreating: false,

//     error: null,
//   },
//   reducers: {
//     clearError: (state) => { state.error = null; },
//     setMyProfile: (state, action) => { state.myProfile = action.payload; },
//     clearCurrentAdvertisement: (state) => { state.currentAdvertisement = null; },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Create
//       .addCase(createSubAdmin.pending, (state) => { state.creating = true; })
//       .addCase(createSubAdmin.fulfilled, (state) => { state.creating = false; })
//       .addCase(createSubAdmin.rejected, (state, action) => { state.creating = false; state.error = action.payload?.message; })

//       // Fetch All
//       .addCase(fetchSubAdmins.pending, (state) => { state.loading = true; })
//       .addCase(fetchSubAdmins.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
//       .addCase(fetchSubAdmins.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })

//       // Fetch Permissions
//       .addCase(fetchSubAdminById.fulfilled, (state, action) => {
//         state.permissions[action.payload.subAdminId] = { modulePermissions: action.payload.modulePermissions };
//       })

//       // Update Permissions
//       .addCase(updateSubAdminPermissions.pending, (state) => { state.updating = true; })
//       .addCase(updateSubAdminPermissions.fulfilled, (state, action) => {
//         state.updating = false;
//         state.permissions[action.payload.subAdminId] = { modulePermissions: action.payload.modulePermissions };
//       })

//       // Delete Sub-Admin
//       .addCase(deleteSubAdmin.pending, (state) => { state.deleting = true; })
//       .addCase(deleteSubAdmin.fulfilled, (state, action) => {
//         state.deleting = false;
//         state.list = state.list.filter(item => item.id !== action.payload.subAdminId);
//         delete state.permissions[action.payload.subAdminId];
//       })
//       .addCase(deleteSubAdmin.rejected, (state, action) => { state.deleting = false; state.error = action.payload?.message; })

//       // Delete Module Permission
//       .addCase(deleteModulePermission.pending, (state) => { state.updating = true; })
//       .addCase(deleteModulePermission.fulfilled, (state, action) => {
//         state.updating = false;
//         // Permissions already refreshed by fetchSubAdminById in thunk
//       })

//       .addCase(fetchAllAdvertisements.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllAdvertisements.fulfilled, (state, action) => {
//         state.loading = false;
//         state.advertisements = action.payload; // assuming payload is the array
//       })
//       .addCase(fetchAllAdvertisements.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || "Failed to fetch advertisements";
//       })

//       // === Advertisement: Fetch by ID ===
//       // Fetch single advertisement
//       .addCase(fetchAdvertisementById.pending, (state) => {
//         state.adLoading = true;
//         state.currentAd = null;
//         state.adError = null;
//       })
//       .addCase(fetchAdvertisementById.fulfilled, (state, action) => {
//         state.adLoading = false;
//         state.currentAd = action.payload;
//       })
//       .addCase(fetchAdvertisementById.rejected, (state, action) => {
//         state.adLoading = false;
//         state.adError = action.payload?.message || 'Failed to fetch advertisement';
//       })

//       //=== Franchise request get by id ===


//       .addCase(fetchFranchiseById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchFranchiseById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.franchise = action.payload; // store fetched franchise object
//       })
//       .addCase(fetchFranchiseById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || "Failed to fetch franchise";
//       })






//       // === Advertisement: Create ===
//       .addCase(createAdvertisement.pending, (state) => {
//         state.advCreating = true;
//       })
//     .addCase(createAdvertisement.fulfilled, (state, action) => {
//       state.advCreating = false;
//       state.advertisements.unshift(action.payload);
//     })
//     .addCase(createAdvertisement.rejected, (state, action) => {
//       state.advCreating = false;
//       state.error = action.payload?.message;
//     })

//     // === Advertisement: Delete ===
//     .addCase(deleteAdvertisement.pending, (state) => {
//       state.deleting = true;
//     })
//     .addCase(deleteAdvertisement.fulfilled, (state, action) => {
//       state.deleting = false;
//       state.advertisements = state.advertisements.filter(adv => adv.id !== action.payload.id);
//     })
//     .addCase(deleteAdvertisement.rejected, (state, action) => {
//       state.deleting = false;
//       state.error = action.payload?.message;
//     });
// },
// });

// export const { clearError, setMyProfile, clearCurrentAdvertisement } = subAdminSlice.actions;
// export default subAdminSlice.reducer;



// src/redux/slices/subAdminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
const authHeader = () => {
  const token = localStorage.getItem('subAdminToken') || localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};
/* ==================== 1. CREATE SUB-ADMIN ==================== */
export const createSubAdmin = createAsyncThunk(
  'subAdmin/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/api/subAdmin/create', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to create sub-admin' });
    }
  }
);
/* ==================== 2. FETCH ALL SUB-ADMINS + PERMISSIONS (Refresh-Proof) ==================== */
export const fetchSubAdmins = createAsyncThunk(
  'subAdmin/fetchAll',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.get('/api/admin/permissions/subadmins');
      const subAdmins = Array.isArray(res.data.data) ? res.data.data : [];
      // Automatically load permissions for each sub-admin
      subAdmins.forEach((subAdmin) => {
        if (subAdmin.id) {
          dispatch(fetchSubAdminById(subAdmin.id));
        }
      });
      return subAdmins;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to load sub-admins' });
    }
  }
);
/* ==================== 3. GET PERMISSIONS BY ID ==================== */
export const fetchSubAdminById = createAsyncThunk(
  'subAdmin/fetchById',
  async (subAdminId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/admin/permissions/${subAdminId}`);
      const records = Array.isArray(res.data.data) ? res.data.data : [];
      const grouped = {};
      records.forEach((r) => {
        if (!grouped[r.module]) grouped[r.module] = [];
        grouped[r.module].push(r.action);
      });
      const modulePermissions = Object.entries(grouped).map(([module, actions]) => ({
        module,
        actions,
      }));
      return { subAdminId, modulePermissions };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to load permissions' });
    }
  }
);
/* ==================== 4. UPDATE PERMISSIONS ==================== */
export const updateSubAdminPermissions = createAsyncThunk(
  'subAdmin/updatePermissions',
  async ({ subAdminId, modulePermissions }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put('/api/admin/permissions/update', {
        subAdminId,
        modulePermissions,
      });
      return { subAdminId, modulePermissions, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update permissions' });
    }
  }
);
/* ==================== 5. DELETE ENTIRE SUB-ADMIN ==================== */
export const deleteSubAdmin = createAsyncThunk(
  'subAdmin/delete',
  async (subAdminId, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.delete(`/api/admin/permissions/${subAdminId}/delete-subadmin`);
      dispatch(fetchSubAdmins()); // Refresh list
      return { subAdminId, message: res.data.message || `SubAdmin deleted successfully with ID: ${subAdminId}` };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to delete sub-admin' });
    }
  }
);
/* ==================== 6. DELETE SPECIFIC MODULE PERMISSION ==================== */
export const deleteModulePermission = createAsyncThunk(
  'subAdmin/deleteModulePermission',
  async ({ subAdminId, module }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.delete(
        `/api/admin/permissions/${subAdminId}/module/${module}`
      );
      // Refetch permissions to update UI
      dispatch(fetchSubAdminById(subAdminId));
      return { subAdminId, module, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to remove module permission' });
    }
  }
);
/* ==================== 7. UPDATE MY PROFILE (Optional) ==================== */
export const updateMyProfile = createAsyncThunk(
  'subAdmin/updateMyProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put('/api/v1/users/profile-update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Profile update failed' });
    }
  }
);
/* ==================== 1. GET ALL ADVERTISEMENTS ==================== */
export const fetchAllAdvertisements = createAsyncThunk(
  "advertisement/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const subAdminToken = localStorage.getItem("subAdminToken");
      const response = await axiosInstance.get("/api/admin/permissions/allAdvertisement", {
        headers: {
          Authorization: `Bearer ${subAdminToken}`,
        },
      });
      return response.data; // this is the array of advertisements
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);
/* ==================== 2. GET ADVERTISEMENT BY ID ==================== */
export const fetchAdvertisementById = createAsyncThunk(
  "subAdmin/fetchAdvertisementById",
  async (id, { rejectWithValue }) => {
    try {
      const subAdminToken = localStorage.getItem("subAdminToken");
      if (!subAdminToken) {
        return rejectWithValue({ message: "SubAdmin token not found" });
      }
      console.log("Token used for fetchAdvertisementById:", subAdminToken);
      const response = await axiosInstance.get(
        `/api/admin/permissions/advertisement/${id}`,
        {
          headers: {
            Authorization: `Bearer ${subAdminToken}`,
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(
        "Error fetching advertisement by ID:",
        err.response?.data || err.message
      );
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch advertisement" }
      );
    }
  }
);
/* ==================== 3. CREATE ADVERTISEMENT (multipart + headers) ==================== */
export const createAdvertisement = createAsyncThunk(
  'advertisement/create',
  async (formData, { rejectWithValue }) => {
    try {
      const subAdminToken = localStorage.getItem("subAdminToken");
      if (!subAdminToken) {
        return rejectWithValue({ message: "SubAdmin token not found" });
      }
      console.log("Token used for createAdvertisement:", subAdminToken);
      const res = await axiosInstance.post(`/api/admin/permissions`, formData, {
        headers: {
          Authorization: `Bearer ${subAdminToken}`,
          validFrom: formData.get('validFrom'),
          validTo: formData.get('validUntil'),
        },
      });
      return res.data;
    } catch (err) {
      console.error("Advertisement creation error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data || { message: 'Failed to create advertisement' });
    }
  }
);
export const fetchFranchiseById = createAsyncThunk(
  "subAdmin/fetchFranchiseById",
  async (id, { rejectWithValue }) => {
    try {
      console.log("12345678");
      // Get token from localStorage
      const subAdminToken = localStorage.getItem("subAdminToken");
      if (!subAdminToken) {
        return rejectWithValue({ message: "SubAdmin token not found" });
      }
      console.log("Token used for fetchFranchiseById:", subAdminToken);
      // Make GET request
      const response = await axiosInstance.get(
        `/api/admin/permissions/franchisee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${subAdminToken}`,
            Accept: "application/json",
          },
        }
      );
      return response.data; // returns the franchise object
    } catch (err) {
      console.log("errororr", err);
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch franchise" }
      );
    }
  }
);
/* ==================== 4. DELETE ADVERTISEMENT ==================== */
export const deleteAdvertisement = createAsyncThunk(
  "subAdmin/deleteAdvertisementById",
  async (id, { rejectWithValue }) => {
    try {
      // Get token from localStorage
      const subAdminToken = localStorage.getItem("subAdminToken");
      if (!subAdminToken) {
        return rejectWithValue({ message: "SubAdmin token not found" });
      }
      console.log("Token used for deleteAdvertisementById:", subAdminToken);
      // Make DELETE request
      const response = await axiosInstance.delete(
        `/api/admin/permissions/advertisement/${id}`,
        {
          headers: {
            Authorization: `Bearer ${subAdminToken}`,
            Accept: "application/json",
          },
        }
      );
      return response.data; // { success: true, message: "Advertisement deleted successfully" }
    } catch (err) {
      console.error(
        "Error deleting advertisement by ID:",
        err.response?.data || err.message
      );
      return rejectWithValue(
        err.response?.data || { message: "Failed to delete advertisement" }
      );
    }
  }
);
/* ==================== SLICE ==================== */
const subAdminSlice = createSlice({
  name: 'subAdmin',
  initialState: {
    // Sub-admin state
    list: [],
    permissions: {},
    myProfile: null,
    // Advertisement state
    advertisements: [],
    currentAdvertisement: null,
    // Loading states
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    advLoading: false,
    advCreating: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setMyProfile: (state, action) => { state.myProfile = action.payload; },
    clearCurrentAdvertisement: (state) => { state.currentAdvertisement = null; },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createSubAdmin.pending, (state) => { state.creating = true; })
      .addCase(createSubAdmin.fulfilled, (state) => { state.creating = false; })
      .addCase(createSubAdmin.rejected, (state, action) => { state.creating = false; state.error = action.payload?.message; })
      // Fetch All
      .addCase(fetchSubAdmins.pending, (state) => { state.loading = true; })
      .addCase(fetchSubAdmins.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchSubAdmins.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      // Fetch Permissions
      .addCase(fetchSubAdminById.fulfilled, (state, action) => {
        state.permissions[action.payload.subAdminId] = { modulePermissions: action.payload.modulePermissions };
      })
      // Update Permissions
      .addCase(updateSubAdminPermissions.pending, (state) => { state.updating = true; })
      .addCase(updateSubAdminPermissions.fulfilled, (state, action) => {
        state.updating = false;
        state.permissions[action.payload.subAdminId] = { modulePermissions: action.payload.modulePermissions };
      })
      // Delete Sub-Admin
      .addCase(deleteSubAdmin.pending, (state) => { state.deleting = true; })
      .addCase(deleteSubAdmin.fulfilled, (state, action) => {
        state.deleting = false;
        state.list = state.list.filter(item => item.id !== action.payload.subAdminId);
        delete state.permissions[action.payload.subAdminId];
      })
      .addCase(deleteSubAdmin.rejected, (state, action) => { state.deleting = false; state.error = action.payload?.message; })
      // Delete Module Permission
      .addCase(deleteModulePermission.pending, (state) => { state.updating = true; })
      .addCase(deleteModulePermission.fulfilled, (state, action) => {
        state.updating = false;
        // Permissions already refreshed by fetchSubAdminById in thunk
      })
      .addCase(fetchAllAdvertisements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdvertisements.fulfilled, (state, action) => {
        state.loading = false;
        state.advertisements = action.payload; // assuming payload is the array
      })
      .addCase(fetchAllAdvertisements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch advertisements";
      })
      // === Advertisement: Fetch by ID ===
      // Fetch single advertisement
      .addCase(fetchAdvertisementById.pending, (state) => {
        state.adLoading = true;
        state.currentAd = null;
        state.adError = null;
      })
      .addCase(fetchAdvertisementById.fulfilled, (state, action) => {
        state.adLoading = false;
        state.currentAd = action.payload;
      })
      .addCase(fetchAdvertisementById.rejected, (state, action) => {
        state.adLoading = false;
        state.adError = action.payload?.message || 'Failed to fetch advertisement';
      })
      //=== Franchise request get by id ===
      .addCase(fetchFranchiseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFranchiseById.fulfilled, (state, action) => {
        state.loading = false;
        state.franchise = action.payload; // store fetched franchise object
      })
      .addCase(fetchFranchiseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch franchise";
      })
      // === Advertisement: Create ===
      .addCase(createAdvertisement.pending, (state) => {
        state.advCreating = true;
      })
      .addCase(createAdvertisement.fulfilled, (state, action) => {
        state.advCreating = false;
        state.advertisements.unshift(action.payload);
      })
      .addCase(createAdvertisement.rejected, (state, action) => {
        state.advCreating = false;
        state.error = action.payload?.message;
      })
      // === Advertisement: Delete ===
      .addCase(deleteAdvertisement.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deleteAdvertisement.fulfilled, (state, action) => {
        state.deleting = false;
        state.advertisements = state.advertisements.filter(adv => adv.id !== action.payload.id);
      })
      .addCase(deleteAdvertisement.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload?.message;
      });
  },
});
export const { clearError, setMyProfile, clearCurrentAdvertisement } = subAdminSlice.actions;
export default subAdminSlice.reducer;