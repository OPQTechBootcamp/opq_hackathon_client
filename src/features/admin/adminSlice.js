// adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUsersAPI, fetchTeamsAPI, fetchAssignmentsAPI, assignJudgesAPI, unAssignJudgesAPI } from './adminAPI';

const initialState = {
    users: [],
    teams: [],
    assignments: [],
    loading: false,
    error: null,
    registrationSuccess: null, // To track admin initiated user registration success
    registrationError: null,   // To track admin initiated user registration errors
    unassignSuccess: null,      // To track unassign success
    unassignError: null,        // To track unassign errors
};

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (_, thunkAPI) => {
    try {
        return await fetchUsersAPI();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
});

export const fetchTeams = createAsyncThunk('admin/fetchTeams', async (_, thunkAPI) => {
    try {
        return await fetchTeamsAPI();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
});

export const fetchAssignments = createAsyncThunk('admin/fetchAssignments', async (_, thunkAPI) => {
    console.log("Called fetchAssignments");
    try {
        return await fetchAssignmentsAPI();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
    }
});

export const assignJudges = createAsyncThunk('admin/assignJudges', async (data, thunkAPI) => {
    try {
        await assignJudgesAPI(data);
        return data; // Optionally return the assigned data for UI updates
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to assign judges');
    }
});

export const unassignJudge = createAsyncThunk(
    'admin/unassignJudge',
    async (data, thunkAPI) => {
        try {
            const assignmentId = data.assignmentId;
            const response = await unAssignJudgesAPI(assignmentId);
            console.log("Full unassignJudge Response:", response); // Log the entire response
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to unassign judge');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
            state.unassignError = null; // Clear unassign error as well
        },
        clearRegistrationStatus: (state) => {
            state.registrationSuccess = null;
            state.registrationError = null;
        },
        clearUnassignStatus: (state) => {
            state.unassignSuccess = null;
            state.unassignError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
            .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(fetchTeams.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTeams.fulfilled, (state, action) => { state.loading = false; state.teams = action.payload; })
            .addCase(fetchTeams.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(fetchAssignments.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAssignments.fulfilled, (state, action) => { state.loading = false; state.assignments = action.payload; })
            .addCase(fetchAssignments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(assignJudges.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(assignJudges.fulfilled, (state, action) => { state.loading = false; /* Optionally update assignments based on action.payload */ })
            .addCase(assignJudges.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(unassignJudge.pending, (state) => { state.loading = true; state.unassignSuccess = null; state.unassignError = null; })
            .addCase(unassignJudge.fulfilled, (state, action) => {
                state.loading = false;
                state.unassignSuccess = action.payload?.message || 'Judge unassigned successfully!';
                // Update the assignments array by filtering out the unassigned item
                state.assignments = state.assignments.filter(
                    assign => assign.id !== action.meta.arg.assignmentId // Use action.meta.arg to access the original argument
                );
            })
            .addCase(unassignJudge.rejected, (state, action) => {
                state.loading = false;
                state.unassignError = action.payload;
            });
    }
});

export const { clearAdminError, clearRegistrationStatus, clearUnassignStatus } = adminSlice.actions;
export default adminSlice.reducer;