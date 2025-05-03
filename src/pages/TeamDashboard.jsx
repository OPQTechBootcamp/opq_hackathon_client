import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeamDashboard,
} from "../features/teamDashboard/teamDashboardSlice";
import InfoIcon from "@mui/icons-material/Info";
import PeopleIcon from "@mui/icons-material/People";
import ProblemStatementsTable from "../components/ProblemStatementsTable";
import TeamProfileForm from "../components/ProfileCreation";

const TeamDashboard = () => {
  const dispatch = useDispatch();
  const { team, loading, success, error } =
    useSelector((state) => state.teamDashboard);

  const { id, team_name } = useSelector((state) => state.team.team);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);


  useEffect(() => {
    dispatch(fetchTeamDashboard({ id, team_name }));
  }, [dispatch, id, team_name]);


  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => dispatch(fetchTeamDashboard({ id, team_name })), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch, id, team_name]);

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom color="primary">
          Team Dashboard
        </Typography>
        <Button onClick={() => setOpenProfileDialog(true)} variant="outlined" sx={{ mb: 2 }}>
          Complete Team Profile
        </Button>

        <Dialog
          open={openProfileDialog}
          onClose={() => setOpenProfileDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Complete Your Team Profile</DialogTitle>
          <DialogContent>
            <TeamProfileForm />
          </DialogContent>
        </Dialog>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading && <CircularProgress sx={{ mt: 2, mb: 2 }} />}

        {team && (
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              <InfoIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Team
              Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1">
              <strong>Name:</strong> {team.team_name}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Email:</strong> {team.team_email}
            </Typography>

            {team.team_members && (
              <Box mt={2}>
                <Typography variant="subtitle1">
                  <strong>
                    <PeopleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Members:
                  </strong>
                </Typography>
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {Object.entries(team.team_members).map(([key, value]) => (
                    <li key={key}>
                      <Typography variant="body2">{value}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            )}

            <Typography variant="subtitle1">
              <strong>Judge/POC:</strong> {team.judge_name || "N/A"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Group:</strong> {team.section || "N/A"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Team ID:</strong> {team.section_team_id || "N/A"}
            </Typography>
          </Paper>
        )}

        <ProblemStatementsTable page="team" />

        {!team && !loading && !error && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No team data available. Please ensure you are logged in.
          </Alert>
        )}

      </Box>
    </Container>
  );
};

export default TeamDashboard;

