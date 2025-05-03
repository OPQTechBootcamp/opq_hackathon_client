import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Menu, MenuItem, Typography, Button
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import apiInstance from '../utils/apiInstance';
import { getToken, getTeamToken } from '../utils/tokenUtils';
import { useSelector } from 'react-redux';
import RefreshIcon from '@mui/icons-material/Refresh';
const ProblemStatementsTable = ({ page }) => {
  const [problemStatements, setProblemStatements] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [teamSelectedId, setTeamSelectedId] = useState(null);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const teamData = useSelector((state) => state?.team?.team);
  const id = page === "team" ? teamData?.id : null;
  const team_name = page === "team" ? teamData?.team_name : null;
  const role = user?.role;

  useEffect(() => {
    fetchProblems();
    if (page === "team") {
      fetchTeamSelection();
    }
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await apiInstance.get('admin/problem-statements', {
        headers: {
          Authorization: `Bearer ${page === "team" ? getTeamToken() : getToken()}`
        }
      });
      setProblemStatements(res.data);
    } catch (err) {
      console.error("Error fetching problems", err);

      if (err.response?.status === 403) {
        setAccessBlocked(true);
        const msg = err.response?.data?.error || '';

        // Match total minutes from error message (e.g., "check back in 87 minutes")
        const minutesMatch = msg.match(/(\d+)\s+minutes?/i);
        if (minutesMatch) {
          const totalMins = parseInt(minutesMatch[1], 10);
          const hours = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          const formatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
          setRemainingMinutes(formatted);
        }
      }

    }
  };


  const fetchTeamSelection = async () => {
    try {
      const res = await apiInstance.post('/teamDashboard/selected-problem-statement', { id, team_name }, {
        headers: { Authorization: `Bearer ${getTeamToken()}` }
      });
      if (res.data?.problem_statement_id) {
        setTeamSelectedId(res.data.problem_statement_id);
      }
    } catch (err) {
      console.error("Failed to fetch team selection", err);
    }
  };

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedProblemId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedProblemId(null);
  };

  const handleViewFile = async (type) => {
    try {
      const res = await apiInstance.get(
        `admin/problem-statement/${selectedProblemId}/file/${type}`,
        {
          headers: {
            Authorization: `Bearer ${page === "team" ? getTeamToken() : getToken()}`
          },
          responseType: 'blob',
        }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);

      const newWindow = window.open("", "_blank", "width=800,height=600");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>PDF View</title></head>
            <body style="margin:0">
              <iframe 
                src="${fileURL}#toolbar=0&navpanes=0&scrollbar=0" 
                width="100%" 
                height="100%" 
                style="border:none;"
              ></iframe>
            </body>
          </html>
        `);
      } else {
        alert('Popup blocked! Please allow popups for this site.');
      }

      handleClose();
    } catch (err) {
      console.error("Error opening file:", err);
      alert("Failed to open file.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this problem statement?")) {
      await apiInstance.delete(`admin/problem-statement/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchProblems();
    }
  };

  const handleSelectProblem = async (problem_id) => {
    if (teamSelectedId) return;

    const confirm = window.confirm("Are you sure? Once selected, it cannot be changed.");
    if (!confirm) return;

    try {
      await apiInstance.post(`/teamDashboard/select-problem-statement/${problem_id}`, { id, team_name }, {
        headers: { Authorization: `Bearer ${getTeamToken()}` }
      });
      setTeamSelectedId(problem_id);
      alert("Problem statement selected successfully.");
    } catch (err) {
      console.error("Selection failed:", err);
      alert("Failed to select problem statement.");
    }
  };
  if (accessBlocked) {
    return (
      <>    <Paper sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Problem Statements</Typography>
        <IconButton onClick={fetchProblems}>
          <RefreshIcon />
        </IconButton>
      </Paper>
        <Paper sx={{ padding: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Hackathon hasn't started yet.
          </Typography>
          <Typography variant="body1" mt={2}>
            Please check back in {remainingMinutes || 'a while'} and refresh the page.
          </Typography>
        </Paper></>
    );
  }
  return (
    <><Paper sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6">Problem Statements</Typography>
      <IconButton onClick={fetchProblems}>
        <RefreshIcon />
      </IconButton>
    </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Overview File</TableCell>
              <TableCell>In-depth File</TableCell>
              {page === "team" && <TableCell>Select</TableCell>}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {problemStatements.map((ps) => (
              <TableRow
                key={ps.id}
                sx={page === "team" && ps.id === teamSelectedId ? { backgroundColor: "#e0f7fa" } : {}}
              >
                <TableCell>{ps.title}</TableCell>
                <TableCell>{ps.description || '—'}</TableCell>
                <TableCell>{ps.overview_file_name || '—'}</TableCell>
                <TableCell>{ps.in_depth_file_name || '—'}</TableCell>

                {page === "team" && (
                  <TableCell>
                    {teamSelectedId ? (
                      ps.id === teamSelectedId ? (
                        <Typography fontWeight="bold" color="primary">Selected</Typography>
                      ) : (
                        <Typography color="text.secondary">—</Typography>
                      )
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSelectProblem(ps.id)}
                      >
                        Select
                      </Button>
                    )}
                  </TableCell>
                )}

                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, ps.id)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedProblemId === ps.id}
                    onClose={handleClose}
                  >
                    {ps.overview_file_name && (
                      <MenuItem onClick={() => handleViewFile('overview')}>View Overview</MenuItem>
                    )}
                    {ps.in_depth_file_name && (
                      <MenuItem onClick={() => handleViewFile('in-depth')}>View In-Depth</MenuItem>
                    )}
                    {role === 'admin' && (
                      <MenuItem onClick={() => handleDelete(ps.id)}>Delete</MenuItem>
                    )}
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer></>
  );
};

export default ProblemStatementsTable;
