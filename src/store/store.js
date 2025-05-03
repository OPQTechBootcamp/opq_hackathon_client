import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import teamReducer from '../features/team/teamSlice';
import teamDashboardReducer from '../features/teamDashboard/teamDashboardSlice';
import submissionReducer from '../features/teamDashboard/submissionSlice';
import registrationReducer from '../features/registration/registrationSlice';
import adminReducer from '../features/admin/adminSlice';
import adminUsersReducer from '../features/admin/adminUsersSlice';
import roundsReducer from '../features/rounds/roundsSlice';
import roundStatusReducer from '../features/rounds/roundStatusSlice';
import judgeDashboardReducer from '../features/judgeDashboard/judgeDashboardSlice';
import schedulesReducer from '../features/schedules/schedulesSlice';
import timerReducer from '../features/timerSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    team: teamReducer,
    teamDashboard: teamDashboardReducer,
    submission: submissionReducer,
    register: registrationReducer,
    admin: adminReducer,
    adminUsers: adminUsersReducer,
    judgeDashboard: judgeDashboardReducer,
    rounds: roundsReducer,
    roundStatus: roundStatusReducer,
    schedules: schedulesReducer,
    timer: timerReducer,
  },
});

export default store;
