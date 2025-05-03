import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTeamDashboardAPI, submitRoundEntryAPI } from "./teamDashboardAPI";

export const fetchTeamDashboard = createAsyncThunk(
  "teamDashboard/fetch",
  async (data, thunkAPI) => {
    try {
      return await getTeamDashboardAPI(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch"
      );
    }
  }
);

export const submitRoundEntry = createAsyncThunk(
  "teamDashboard/submitEntry",
  async (data, thunkAPI) => {
    try {
      return await submitRoundEntryAPI(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Submission failed"
      );
    }
  }
);

const teamDashboardSlice = createSlice({
  name: "teamDashboard",
  initialState: {
    team: null,
    status: null,
    currentRound: null,
    nextRound: null,
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
      .addCase(fetchTeamDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const {
          team_name,
          team_email,
          team_members,
          judge_name,
          section,
          section_team_id,
          problem_statement_title,
        } = action.payload;
        state.team = {
          team_name,
          team_email,
          team_members,
          judge_name,
          problem_statement_title,
          section,
          section_team_id,
        };
      })
      .addCase(fetchTeamDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitRoundEntry.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitRoundEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(submitRoundEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStatus } = teamDashboardSlice.actions;
export default teamDashboardSlice.reducer;
