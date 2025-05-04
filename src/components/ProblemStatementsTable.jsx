import React, { useEffect, useState, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Menu, MenuItem, Typography, Button, Box, Chip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimerIcon from '@mui/icons-material/Timer';
import apiInstance from '../utils/apiInstance';
import { getToken, getTeamToken } from '../utils/tokenUtils';
import { useSelector } from 'react-redux';

const ProblemStatementsTable = ({ page }) => {
  const [problemStatements, setProblemStatements] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [teamSelectedId, setTeamSelectedId] = useState(null);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(null);
  const [selectionTime, setSelectionTime] = useState({
    minutes: 0,
    seconds: 0
  });
  const timerRef = useRef(null);
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
    
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCountdownTimer = (totalMinutes) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Calculate initial time
    let totalSeconds = totalMinutes * 60;
    
    // Update state immediately
    setSelectionTime({
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60
    });
    
    // Set up interval
    timerRef.current = setInterval(() => {
      totalSeconds -= 1;
      
      if (totalSeconds <= 0) {
        clearInterval(timerRef.current);
        // Refresh data when timer expires
        fetchProblems();
      }
      
      setSelectionTime({
        minutes: Math.floor(totalSeconds / 60),
        seconds: totalSeconds % 60
      });
    }, 1000);
  };

  const fetchProblems = async () => {
    try {
      const res = await apiInstance.get('admin/problem-statements', {
        headers: {
          Authorization: `Bearer ${page === "team" ? getTeamToken() : getToken()}`
        }
      });
      
      // Check if response includes the new structure with problemStatements and selectionRemainingMins
      if (res.data && res.data.problemStatements) {
        setProblemStatements(res.data.problemStatements);
        
        // Start timer if there's remaining time for selection and we're on the team page
        if (page === "team" && res.data.selectionRemainingMins > 0) {
          startCountdownTimer(res.data.selectionRemainingMins);
        }
      } else {
        // Handle old API format
        setProblemStatements(res.data);
      }
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
  
  // Format the timer display
  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (accessBlocked) {
    return (
      <>    
        <Paper sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </Paper>
      </>
    );
  }

  return (
    <>
      <Paper sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Problem Statements</Typography>
          {page === "team" && (selectionTime.minutes > 0 || selectionTime.seconds > 0) && (
            <Chip 
              icon={<TimerIcon />} 
              label={`Selection time: ${formatTime(selectionTime.minutes, selectionTime.seconds)}`}
              color="primary"
              sx={{ 
                fontWeight: 'bold',
                '& .MuiChip-icon': { color: 'inherit' }
              }}
            />
          )}
        </Box>
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
            {Array.isArray(problemStatements) && problemStatements.map((ps) => (
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
                        // disabled={selectionTime.minutes === 0 && selectionTime.seconds === 0}
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
            {(!problemStatements || problemStatements.length === 0) && (
              <TableRow>
                <TableCell colSpan={page === "team" ? 6 : 5} align="center">
                  No problem statements available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ProblemStatementsTable;