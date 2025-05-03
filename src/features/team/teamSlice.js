import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginTeamAPI, registerTeamAPI } from './teamAPI';

const initialState = {
  team: null,
  token: localStorage.getItem('teamToken') || null,
  loading: false,
  error: null,
};

export const registerTeam = createAsyncThunk('team/register', async (data, thunkAPI) => {
  try {
    const res = await registerTeamAPI(data);
    localStorage.setItem('teamToken', res.token);
    return res;
  } catch (err) {
    const message = err.response?.data?.message || 'Registration failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const loginTeam = createAsyncThunk('team/login', async (credentials, thunkAPI) => {
  try {
    const res = await loginTeamAPI(credentials);
    localStorage.setItem('teamToken', res.token);
    return res;
  } catch (err) {
    const message = err.response?.data?.message || 'Login failed';
    return thunkAPI.rejectWithValue(message);
  }
});

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    logoutTeam: (state) => {
      localStorage.removeItem('teamToken');
      state.team = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.team = action.payload.team;
        state.token = action.payload.token;
      })
      .addCase(registerTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.team = action.payload.team;
        state.token = action.payload.token;
      })
      .addCase(loginTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutTeam } = teamSlice.actions;
export default teamSlice.reducer;
