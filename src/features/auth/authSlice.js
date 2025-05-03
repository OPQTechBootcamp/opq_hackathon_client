import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, fetchUserProfile } from './authAPI';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const data = await loginAPI(credentials);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Login failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, thunkAPI) => {
    try {
      const data = await fetchUserProfile();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  });

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.status = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = action.payload.status;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        // localStorage.removeItem('token');
      })
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
