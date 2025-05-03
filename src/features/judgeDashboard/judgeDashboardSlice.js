import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiInstance from "../../utils/apiInstance";
import { getToken } from "../../utils/tokenUtils";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});
// Async Thunk to fetch teams assigned to a judge
export const fetchAssignedTeams = createAsyncThunk(
  "judgeDashboard/fetchAssignedTeams",
  async (judgeId, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get(
        `judge/assigned-teams/${judgeId}`,
        authHeader()
      );
      return response.data;
    } catch (error) {
      // Handle error responses and provide a more informative error
      if (error.response && error.response.data && error.response.data.error) {
        return rejectWithValue(error.response.data.error);
      } else {
        return rejectWithValue(
          error.message || "Failed to fetch assigned teams."
        );
      }
    }
  }
);

// Async Thunk to submit a judge's evaluation
export const submitEvaluation = createAsyncThunk(
  "judgeDashboard/submitEvaluation",
  async (evaluationData, { rejectWithValue }) => {
    try {
      const response = await apiInstance.post(
        `judge/submit`,
        evaluationData,
        authHeader()
      );
      return response.data; // Expecting a success message or data back
    } catch (error) {
      // Handle error responses for evaluation submission
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message || "Failed to submit evaluation.");
      }
    }
  }
);

// New Async Thunk: fetchAllTeamsRatings
export const fetchAllTeamsRatings = createAsyncThunk(
  "judgeDashboard/fetchAllTeamsRatings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get(
        `judge/all-teams-ratings`,
        authHeader()
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        return rejectWithValue(error.response.data.error);
      } else {
        return rejectWithValue(
          error.message || "Failed to fetch all teams ratings."
        );
      }
    }
  }
);

const judgeDashboardSlice = createSlice({
  name: "judgeDashboard",
  initialState: {
    assignedTeams: [],
    allTeamsRatings: [], // New state for all teams ratings
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearStatus: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAssignedTeams lifecycle
      .addCase(fetchAssignedTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedTeams = action.payload;
      })
      .addCase(fetchAssignedTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Use payload from rejectWithValue
      })
      // Handle submitEvaluation lifecycle
      .addCase(submitEvaluation.pending, (state) => {
        state.loading = true; // Optionally set loading during submission
        state.error = null;
        state.success = null;
      })
      .addCase(submitEvaluation.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload?.message || "Evaluation submitted successfully!"; // Access message if available
      })
      .addCase(submitEvaluation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Use payload from rejectWithValue
      })
      // Handle fetchAllTeamsRatings lifecycle
      .addCase(fetchAllTeamsRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTeamsRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.allTeamsRatings = action.payload; // Store the fetched ratings
      })
      .addCase(fetchAllTeamsRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStatus } = judgeDashboardSlice.actions;
export default judgeDashboardSlice.reducer;
