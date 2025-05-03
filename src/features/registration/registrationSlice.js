import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUserAPI } from '../auth/authAPI';

const initialState = {
    loading: false,
    error: null,
    status: null,
    message: null,
    registeredUser: null,
};

export const registerUser = createAsyncThunk(
    'registration/registerUser',
    async (userDetails, thunkAPI) => {
        try {
            const data = await registerUserAPI(userDetails);
            return data;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'Registration failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const registrationSlice = createSlice({
    name: 'registration',
    initialState,
    reducers: {
        resetRegistrationStatus: (state) => {
            state.loading = false;
            state.error = null;
            state.status = null;
            state.message = null;
            state.registeredUser = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.status = null;
                state.message = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.status = action.payload?.status;
                state.message = action.payload?.message;
                state.registeredUser = action.payload?.user || null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = 'error';
                state.message = action.payload;
            });
    },
});

export const { resetRegistrationStatus } = registrationSlice.actions;
export default registrationSlice.reducer;