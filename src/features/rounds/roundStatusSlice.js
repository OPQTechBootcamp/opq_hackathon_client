// redux/rounds/roundStatusSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getToken } from "../../utils/tokenUtils";
import apiInstance from "../../utils/apiInstance";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const fetchRoundStatus = createAsyncThunk(
  "roundStatus/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiInstance.get(`rounds/status`, authHeader());
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch round status"
      );
    }
  }
);

const roundStatusSlice = createSlice({
  name: "roundStatus",
  initialState: {
    rounds: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoundStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoundStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.rounds = action.payload;
      })
      .addCase(fetchRoundStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default roundStatusSlice.reducer;
