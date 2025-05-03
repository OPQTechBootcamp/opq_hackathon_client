import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiInstance from '../utils/apiInstance';
export const fetchTimeRemaining = createAsyncThunk(
  'timer/fetchTimeRemaining',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get(`hackathon/time-remaining`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const timerSlice = createSlice({
  name: 'timer',
  initialState: {
    started: false,
    remaining: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: '0d 0h 0m 0s'
    },
    loading: false,
    error: null,
    lastFetched: null
  },
  reducers: {
    updateTimer: (state, action) => {
      // Decrement the timer by one second
      const { days, hours, minutes, seconds } = state.remaining;
      
      if (seconds > 0) {
        state.remaining.seconds = seconds - 1;
      } else if (minutes > 0) {
        state.remaining.minutes = minutes - 1;
        state.remaining.seconds = 59;
      } else if (hours > 0) {
        state.remaining.hours = hours - 1;
        state.remaining.minutes = 59;
        state.remaining.seconds = 59;
      } else if (days > 0) {
        state.remaining.days = days - 1;
        state.remaining.hours = 23;
        state.remaining.minutes = 59;
        state.remaining.seconds = 59;
      }
      
      // Update formatted string
      state.remaining.formatted = `${state.remaining.days}d ${state.remaining.hours}h ${state.remaining.minutes}m ${state.remaining.seconds}s`;
      
      // Check if timer has reached zero
      if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        state.started = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeRemaining.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTimeRemaining.fulfilled, (state, action) => {
        state.loading = false;
        state.started = action.payload.started;
        state.remaining = action.payload.remaining;
        state.lastFetched = new Date().getTime();
        state.error = null;
      })
      .addCase(fetchTimeRemaining.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch time remaining';
      });
  }
});

export const { updateTimer } = timerSlice.actions;
export default timerSlice.reducer;