import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedTeamRoute from "./components/ProtectedTeamRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import Unauthorized from "./components/Unauthorized";
import RoundManagementPage from "./pages/RoundManagementPage";
import RoundStatusDashboard from "./pages/RoundStatusDashboard";

// Lazy load components
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterUser = lazy(() => import("./pages/RegisterUser"));
const TeamRegisterPage = lazy(() => import("./pages/TeamRegisterPage"));
const TeamLoginPage = lazy(() => import("./pages/TeamLoginPage"));
const TeamDashboard = lazy(() => import("./pages/TeamDashboard"));

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ProblemStatementUpload = lazy(() =>
  import("./pages/ProblemStatementUpload")
);
const CoordinatorDashboard = lazy(() => import("./pages/CoordinatorDashboard"));
const FacultyDashboard = lazy(() => import("./pages/FacultyDashboard"));
const AdminTeamsPage = lazy(() => import("./pages/AdminTeamsPage"));
const AdminAccessManagement = lazy(() =>
  import("./pages/AdminAccessManagement")
);
const AdminUsersScreen = lazy(() => import("./pages/AdminUsersScreen"));
const AdminHackathonSchedulePage = lazy(() =>
  import("./pages/AdminHackathonSchedulePage")
);
const ImportantLinks = lazy(() => import("./pages/ImportantLinks"));
const AdminResultsScreen = lazy(() => import("./pages/AdminResultsScreen"));
const JudgeDashboard = lazy(() => import("./pages/JudgeDashboard"));
const JudgeRegistration = lazy(() => import("./pages/JudgeRegistration"));
const JudgeManagement = lazy(() => import("./pages/JudgeManagement"));
const NotFound = lazy(() => import("./components/NotFound"));
const JudgingCriteria = lazy(() => import("./components/JudgingCriteria"));

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/team/register" element={<TeamRegisterPage />} />
          <Route path="/judge/register" element={<JudgeRegistration />} />
          <Route path="/team/login" element={<TeamLoginPage />} />
          <Route path="/important-links" element={<ImportantLinks />} />
          <Route path="/judging-criteria" element={<JudgingCriteria />} />
          <Route
            path="/teamDashboard"
            element={
              <ProtectedTeamRoute>
                <TeamDashboard />
              </ProtectedTeamRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/admin/judgeManagement"
            element={
              <ProtectedRoute roles={["admin", "coordinator", "faculty"]}>
                <JudgeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/accessManagement"
            element={
              <ProtectedRoute roles={["admin", "coordinator"]}>
                <AdminAccessManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/register"
            element={
              <ProtectedRoute roles={["admin"]}>
                <RegisterUser />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/user-teams"
            element={
              <ProtectedRoute roles={["admin", "coordinator", "faculty"]}>
                <AdminUsersScreen />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/admin/results"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminResultsScreen />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/coordinator/section-management"
            element={
              <ProtectedRoute roles={["coordinator"]}>
                <AdminTeamsPage />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/coordinator/dashboard"
            element={
              <ProtectedRoute roles={["coordinator"]}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />{" "}          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute roles={["faculty"]}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/admin/round-management"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminHackathonSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/problem-statement"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ProblemStatementUpload />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/admin/round-status"
            element={
              <ProtectedRoute roles={["admin"]}>
                <RoundStatusDashboard />
              </ProtectedRoute>
            }
          />
          {/* Judge Routes */}
          <Route
            path="/judge/dashboard"
            element={
              <ProtectedRoute roles={["judge"]}>
                <JudgeDashboard />
              </ProtectedRoute>
            }
          />
          {/* Default Fallback or 404 */}
          <Route path="*" element={<NotFound />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
