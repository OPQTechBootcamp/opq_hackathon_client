import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiInstance from '../../utils/apiInstance';

export const fetchSchedules = createAsyncThunk('schedules/fetchAll', async () => {
  const res = await apiInstance.get('schedules');
  return res.data;
});

export const addSchedule = createAsyncThunk(
  'schedules/addSchedule',
  async (data) => {
    const res = await apiInstance.post('schedules', data);
    return res.data; // <-- important
  }
);

export const editSchedule = createAsyncThunk(
  'schedules/editSchedule',
  async ({ id, data }) => {
    const res = await apiInstance.put(`schedules/${id}`, data);
    return res.data;
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedules/deleteSchedule',
  async (id) => {
    const res = await apiInstance.delete(`schedules/${id}`);
    return res.data;
  }
);

const schedulesSlice = createSlice({
  name: 'hackathonSchedules',
  initialState: { schedules: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addSchedule.fulfilled, (state, action) => {
        state.schedules.push(action.payload);
      })
      .addCase(editSchedule.fulfilled, (state, action) => {
        const idx = state.schedules.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.schedules[idx] = action.payload;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter(s => s.id !== action.payload);
      });
  }
});

export default schedulesSlice.reducer;
