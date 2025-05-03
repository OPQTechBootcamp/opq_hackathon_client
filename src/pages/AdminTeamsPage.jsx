import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsersAndTeams } from '../features/admin/adminUsersSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiInstance from '../utils/apiInstance';
import { getToken } from "../utils/tokenUtils";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
}));

const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'I', 'J'];

const AssignSectionComponent = ({ team, onSectionAssigned }) => {
  const [selectedSection, setSelectedSection] = useState(team.section || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const handleAssign = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      if (!selectedSection) throw new Error("Please select a section.");
      
      const url = editMode
        ? `/section/${team.id}/update`
        : `/section/${team.id}/assign-section`;

      const response = await apiInstance.post(url, { 
        section: selectedSection, 
        newSection: selectedSection 
      }, authHeader());

      if (response.status === 200) {
        onSectionAssigned();
        setEditMode(false);
      } else {
        setSubmissionError("Failed to assign section.");
      }
    } catch (err) {
      console.error("Error assigning section", err);
      setSubmissionError("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Select
        value={selectedSection}
        onChange={(e) => setSelectedSection(e.target.value)}
        size="small"
        disabled={!editMode && !!team.section}
        fullWidth
      >
        <MenuItem value="" disabled>Select Section</MenuItem>
        {sections.map((sec) => (
          <MenuItem key={sec} value={sec}>{sec}</MenuItem>
        ))}
      </Select>
      <Button
        onClick={handleAssign}
        variant="contained"
        size="small"
        disabled={isSubmitting || (!editMode && !!team.section)}
      >
        {isSubmitting ? <CircularProgress size={20} /> : (editMode ? 'Update' : 'Assign')}
      </Button>
      {!!team.section && (
        <Button
          onClick={() => setEditMode(true)}
          variant="outlined"
          size="small"
        >
          Edit
        </Button>
      )}
      {submissionError && (
        <Typography color="error" variant="caption">{submissionError}</Typography>
      )}
    </Box>
  );
};


const AdminTeamsPage = () => {
  const dispatch = useDispatch();
  const { users, teams, loading, error } = useSelector((state) => state.adminUsers);
  const [localTeams, setLocalTeams] = useState([]);

  useEffect(() => {
    dispatch(fetchAllUsersAndTeams());
  }, [dispatch]);

  useEffect(() => {
    setLocalTeams(teams);
  }, [teams]);

  const handleRefresh = () => {
    dispatch(fetchAllUsersAndTeams());
  };

  const handleSectionAssigned = () => {
    dispatch(fetchAllUsersAndTeams());
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={600}>
          Coordinator Section Assignment
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>ID</StyledTableCell>
                <StyledTableCell>Team Name</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Section</StyledTableCell>
                <StyledTableCell>Section Team ID</StyledTableCell>
                <StyledTableCell>Team Size</StyledTableCell>
                <StyledTableCell>Assign Section</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {localTeams && localTeams.length > 0 ? (
                localTeams.map((team) => (
                  <TableRow key={team.id} hover>
                    <TableCell>{team.id}</TableCell>
                    <TableCell>{team.team_name}</TableCell>
                    <TableCell>{team.team_email}</TableCell>
                    <TableCell>{team.section || '—'}</TableCell>
                    <TableCell>{team.section_team_id || '—'}</TableCell>
                    <TableCell>{team.team_size}</TableCell>
              
                    <TableCell>
                      <AssignSectionComponent
                        team={team}
                        onSectionAssigned={handleSectionAssigned}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No teams found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminTeamsPage;
