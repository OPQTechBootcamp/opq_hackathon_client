import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getToken } from "../../utils/tokenUtils";
import apiInstance from "../../utils/apiInstance";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// Async Thunk to fetch all rounds
export const fetchRounds = createAsyncThunk(
  "rounds/fetchRounds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get("rounds", authHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch rounds."
      );
    }
  }
);

// Async Thunk to create a new round
export const createRound = createAsyncThunk(
  "rounds/createRound",
  async (roundData, { rejectWithValue }) => {
    try {
      const response = await apiInstance.post(
        "rounds",
        roundData,
        authHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create round."
      );
    }
  }
);

// Async Thunk to update an existing round
export const updateRound = createAsyncThunk(
  "rounds/updateRound",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await apiInstance.put(
        `rounds/${id}`,
        updatedData,
        authHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update round."
      );
    }
  }
);

// Async Thunk to delete a round
export const deleteRound = createAsyncThunk(
  "rounds/deleteRound",
  async (id, { rejectWithValue }) => {
    try {
      await apiInstance.delete(`rounds/${id}`, authHeader());
      return id; // Return the ID of the deleted round for updating the state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete round."
      );
    }
  }
);

const roundsSlice = createSlice({
  name: "rounds",
  initialState: {
    rounds: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRounds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRounds.fulfilled, (state, action) => {
        state.loading = false;
        state.rounds = action.payload;
      })
      .addCase(fetchRounds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createRound.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRound.fulfilled, (state, action) => {
        state.loading = false;
        state.rounds.push(action.payload); // Update with the full created round from the server
      })
      .addCase(createRound.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateRound.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRound.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rounds.findIndex(
          (round) => round.id === action.payload.id
        );
        if (index !== -1) {
          state.rounds[index] = action.payload; // Update with the full updated round from the server
        }
      })
      .addCase(updateRound.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteRound.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRound.fulfilled, (state, action) => {
        state.loading = false;
        state.rounds = state.rounds.filter(
          (round) => round.id !== action.payload
        );
      })
      .addCase(deleteRound.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default roundsSlice.reducer;
