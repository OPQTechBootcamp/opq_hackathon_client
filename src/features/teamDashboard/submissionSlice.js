import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitRoundEntryAPI } from "./teamDashboardAPI";

const initialState = {
    loading: false,
    error: null,
    success: null,
    status: null, // 'success' or 'error' for the submission
};

export const submitRoundEntry = createAsyncThunk(
    "submission/submitEntry",
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

const submissionSlice = createSlice({
    name: "submission",
    initialState,
    reducers: {
        clearSubmissionStatus: (state) => {
            state.loading = false;
            state.error = null;
            state.success = null;
            state.status = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitRoundEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
                state.status = null;
            })
            .addCase(submitRoundEntry.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload?.message || "Entry submitted successfully!";
                state.status = action.payload?.status || 'success';
            })
            .addCase(submitRoundEntry.rejected, (state, action) => {
                console.log("Submission Rejected State:", state);
                console.log("Submission Rejected Action:", action);
                state.loading = false;
                state.error = action.payload || "Submission failed.";
                state.status = 'error';
                state.success = null;
            });
    },
});

export const { clearSubmissionStatus } = submissionSlice.actions;
export default submissionSlice.reducer;