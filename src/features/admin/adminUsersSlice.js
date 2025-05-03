// redux/admin/adminUsersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiInstance from "../../utils/apiInstance"

const getToken = () => localStorage.getItem('token');

const authHeader = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});
export const fetchAllUsersAndTeams = createAsyncThunk('admin/fetchUsersTeams', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiInstance.get(`admin/users-teams`, authHeader());
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users and teams');
  }
});

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState: {
    users: [],
    teams: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsersAndTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsersAndTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.teams = action.payload.teams;
      })
      .addCase(fetchAllUsersAndTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default adminUsersSlice.reducer;
