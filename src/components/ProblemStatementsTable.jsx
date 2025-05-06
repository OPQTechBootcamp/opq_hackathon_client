import React, { useEffect, useState, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, Button, Box, Chip, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, useMediaQuery, useTheme, Card, CardContent,
  Grid, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimerIcon from '@mui/icons-material/Timer';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import apiInstance from '../utils/apiInstance';
import { getToken, getTeamToken } from '../utils/tokenUtils';
import { useSelector } from 'react-redux';

const ProblemStatementsTable = ({ page }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [problemStatements, setProblemStatements] = useState([]);
  const [teamSelectedId, setTeamSelectedId] = useState(null);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(null);
  const [selectionTime, setSelectionTime] = useState({
    minutes: 0,
    seconds: 0
  });
  const [editTime, setEditTime] = useState({
    hours: 0,
    minutes: 0
  });
  const [canEdit, setCanEdit] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    problemId: null
  });
  const [descriptionDialog, setDescriptionDialog] = useState({
    open: false,
    description: ''
  });
  const timerRef = useRef(null);
  const editTimerRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const teamData = useSelector((state) => state?.team?.team);
  const id = page === "team" ? teamData?.id : null;
  const team_name = page === "team" ? teamData?.team_name : null;

  const [refreshing, setRefreshing] = useState(false);
 

  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProblems().finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };
  useEffect(() => {
    fetchProblems();
    if (page === "team") {
      fetchTeamSelection();
    }
    
    // Clean up timers on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (editTimerRef.current) {
        clearInterval(editTimerRef.current);
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

  const startEditCountdownTimer = (totalMinutes) => {
    // Clear any existing timer
    if (editTimerRef.current) {
      clearInterval(editTimerRef.current);
    }
    
    if (totalMinutes <= 0) {
      setCanEdit(false);
      return;
    }
    
    setCanEdit(true);
    
    // Calculate initial time
    let totalSeconds = totalMinutes * 60;
    
    // Update state immediately
    setEditTime({
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60)
    });
    
    // Set up interval
    editTimerRef.current = setInterval(() => {
      totalSeconds -= 1;
      
      if (totalSeconds <= 0) {
        clearInterval(editTimerRef.current);
        setCanEdit(false);
        // Refresh data when timer expires
        fetchProblems();
      }
      
      setEditTime({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60)
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
      setAccessBlocked(false);
      // Check if response includes the new structure
      if (res.data && res.data.problemStatements) {
        setProblemStatements(res.data.problemStatements);
        
        // Start timer if there's remaining time for selection and we're on the team page
        if (page === "team") {
          if (res.data.selectionRemainingMins > 0) {
            startCountdownTimer(res.data.selectionRemainingMins);
          }
          
          if (res.data.editSelectionTimeRemaining > 0) {
            startEditCountdownTimer(res.data.editSelectionTimeRemaining);
          } else {
            setCanEdit(false);
          }
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

  const handleViewFile = async (problemId, type) => {
    try {
      const res = await apiInstance.get(
        `admin/problem-statement/${problemId}/file/${type}`,
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
        setDescriptionDialog({
          open: true,
          description: 'Please enable popups for this site to view the PDF document.'
        });
      }
    } catch (err) {
      console.error("Error opening file:", err);
      setDescriptionDialog({
        open: true,
        description: 'Failed to open file. Please try again.'
      });
    }
  };

  const handleSelectProblem = async (problem_id) => {
    if (!teamData) return;

    // If already selected, don't allow reselection of same problem
    if (teamSelectedId === problem_id) return;

    setConfirmDialog({
      open: true,
      problemId: problem_id,
      isEdit: false
    });
  };
  
  const handleEditProblem = (problem_id) => {
    setConfirmDialog({
      open: true,
      problemId: problem_id,
      isEdit: true
    });
  };
  
  const handleConfirmAction = async () => {
    if (!teamData || !confirmDialog.problemId) return;
    
    try {
      if (confirmDialog.isEdit) {
        // Handle edit action
        await apiInstance.put(`/teamDashboard/edit-problem-statement/${id}`, 
          { 
            team_name, 
            problem_statement_id: confirmDialog.problemId 
          }, 
          {
            headers: { Authorization: `Bearer ${getTeamToken()}` }
          }
        );
      } else {
        // Handle initial selection
        await apiInstance.post(`/teamDashboard/select-problem-statement/${confirmDialog.problemId}`, 
          { id, team_name }, 
          {
            headers: { Authorization: `Bearer ${getTeamToken()}` }
          }
        );
      }
      
      setTeamSelectedId(confirmDialog.problemId);
      setConfirmDialog({ open: false, problemId: null, isEdit: false });
      setDescriptionDialog({
        open: true,
        description: confirmDialog.isEdit 
          ? 'Problem statement updated successfully.'
          : 'Problem statement selected successfully.'
      });
      fetchProblems(); // Refresh to get updated timers
      
    } catch (err) {
      console.error("Action failed:", err);
      setDescriptionDialog({
        open: true,
        description: confirmDialog.isEdit 
          ? 'Failed to update problem statement. Please try again.'
          : 'Failed to select problem statement. Please try again.'
      });
    }
  };
  
  const handleViewFullDescription = (description) => {
    setDescriptionDialog({
      open: true,
      description: description || 'No description available.'
    });
  };
  
  // Format the timer display
  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Format description with "view more" for long text
  const formatDescription = (text) => {
    if (!text) return '—';
    
    if (text.length <= 100) return text;
    
    return (
      <Box>
        {text.substring(0, 100)}...
        <Button 
          size="small" 
          onClick={() => handleViewFullDescription(text)}
          sx={{ ml: 1, fontSize: '0.7rem', p: 0 }}
        >
          view more
        </Button>
      </Box>
    );
  };

  const renderMobileCard = (ps) => {
    const isSelected = ps.id === teamSelectedId;
    
    return (
      <Card 
        key={ps.id} 
        sx={{ 
          mb: 2, 
          border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
          backgroundColor: isSelected ? '#e0f7fa' : 'white'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">{ps.title}</Typography>
            {isSelected && (
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Selected" 
                color="primary" 
                size="small"
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {formatDescription(ps.description)}
          </Typography>
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              {ps.overview_file_name ? (
                <Button 
                  variant="outlined" 
                  size="small"
                  fullWidth
                  onClick={() => handleViewFile(ps.id, 'overview')}
                >
                  Overview
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  size="small"
                  fullWidth
                  disabled
                >
                  No Overview
                </Button>
              )}
            </Grid>
            <Grid item xs={6}>
              {ps.in_depth_file_name ? (
                <Button 
                  variant="outlined" 
                  size="small"
                  fullWidth
                  onClick={() => handleViewFile(ps.id, 'in-depth')}
                >
                  In-depth
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  size="small"
                  fullWidth
                  disabled
                >
                  No In-depth
                </Button>
              )}
            </Grid>
            
            {page === "team" && (
              <Grid item xs={12} sx={{ mt: 1 }}>
                {teamSelectedId ? (
                  isSelected ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography fontWeight="bold" color="primary">Currently Selected</Typography>
                    </Box>
                  ) : canEdit ? (
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      startIcon={<EditIcon />}
                      onClick={() => handleEditProblem(ps.id)}
                    >
                      Change to This Problem
                    </Button>
                  ) : null
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleSelectProblem(ps.id)}
                  >
                    Select This Problem
                  </Button>
                )}
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (accessBlocked) {
    return (
      <>    
        <Paper 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 1 : 0,
            mb: 2,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <EventBusyIcon sx={{ mr: 1 }} /> Problem Statements
          </Typography>
          <Button 
            startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />} 
            onClick={handleRefresh}
            variant="contained"
            color="primary"
            disabled={refreshing}
            fullWidth={isMobile}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Paper>

        <Card 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)'
            }
          }}
        >
          <Box 
            sx={{ 
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <HourglassEmptyIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" color="white" textAlign="center">
              Hackathon Countdown
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            <Alert 
              severity="info" 
              icon={<NotificationsActiveIcon />}
              sx={{ 
                mb: 3, 
                fontWeight: 'medium',
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                The hackathon hasn't started yet
              </Typography>
              <Typography variant="body2">
                Problem statements will be available once the hackathon begins.
              </Typography>
            </Alert>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                p: 3,
                bgcolor: theme.palette.grey[50],
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" color="primary">
                  Time Remaining
                </Typography>
              </Box>
              
              <Chip 
                label={remainingMinutes || 'Calculating...'}
                color="primary"
                sx={{ 
                  fontSize: '1.25rem', 
                  height: 'auto', 
                  p: 2,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              />
              
              <Typography variant="body1" align="center" sx={{ mt: 3, fontStyle: 'italic' }}>
                Please check back in {remainingMinutes || 'a while'} and refresh the page.
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<RefreshIcon />} 
                onClick={handleRefresh}
                sx={{ mt: 3 }}
              >
                Refresh Now
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
              Get your team ready! Once the hackathon starts, you'll have 30-45 minutes to select your problem statement.
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Paper sx={{ 
        padding: 2, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? 1 : 0
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center', 
          gap: 1,
          mb: isMobile ? 1 : 0
        }}>
          <Typography variant="h6">Problem Statements</Typography>
          
          {page === "team" && (selectionTime.minutes > 0 || selectionTime.seconds > 0) && (
            <Chip 
              icon={<TimerIcon />} 
              label={`Selection time: ${formatTime(selectionTime.minutes, selectionTime.seconds)}`}
              color="primary"
              size={isMobile ? "small" : "medium"}
              sx={{ 
                fontWeight: 'bold',
                '& .MuiChip-icon': { color: 'inherit' }
              }}
            />
          )}
          
          {page === "team" && teamSelectedId && canEdit && (
            <Chip 
              icon={<EditIcon />} 
              label={`Edit time: ${editTime.hours}h ${editTime.minutes}m`}
              color="secondary"
              size={isMobile ? "small" : "medium"}
              sx={{ 
                fontWeight: 'bold',
                '& .MuiChip-icon': { color: 'inherit' }
              }}
            />
          )}
        </Box>
        
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={fetchProblems}
          variant="outlined"
          fullWidth={isMobile}
        >
          Refresh
        </Button>
      </Paper>
      
      {page === "team" && !teamSelectedId && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          icon={<InfoIcon />}
        >
          <Typography variant="body2" fontWeight="medium">
            IMPORTANT: You must select a problem statement within 30-45 minutes of the hackathon starting time.
            Choose carefully as this will be the problem your team works on.
          </Typography>
        </Alert>
      )}
      
      {page === "team" && teamSelectedId && canEdit && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          icon={<InfoIcon />}
        >
          <Typography variant="body2" fontWeight="medium">
            You can change your problem statement selection within 4 hours of the hackathon start time.
            After that, your selection will be final.
          </Typography>
        </Alert>
      )}
      
      {/* Mobile View */}
      {isMobile && (
        <Box>
          {Array.isArray(problemStatements) && problemStatements.length > 0 ? (
            problemStatements.map(ps => renderMobileCard(ps))
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No problem statements available</Typography>
            </Paper>
          )}
        </Box>
      )}
      
      {/* Desktop View */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>View Overview</TableCell>
                <TableCell>View In-depth</TableCell>
                {page === "team" && <TableCell>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(problemStatements) && problemStatements.map((ps) => (
                <TableRow
                  key={ps.id}
                  sx={page === "team" && ps.id === teamSelectedId ? { backgroundColor: "#e0f7fa" } : {}}
                >
                  <TableCell>{ps.title}</TableCell>
                  <TableCell>{formatDescription(ps.description)}</TableCell>
                  <TableCell>
                    {ps.overview_file_name ? (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleViewFile(ps.id, 'overview')}
                      >
                        View Overview
                      </Button>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    {ps.in_depth_file_name ? (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleViewFile(ps.id, 'in-depth')}
                      >
                        View In-depth
                      </Button>
                    ) : '—'}
                  </TableCell>

                  {page === "team" && (
                    <TableCell>
                      {teamSelectedId ? (
                        ps.id === teamSelectedId ? (
                          <Typography fontWeight="bold" color="primary">Selected</Typography>
                        ) : canEdit ? (
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditProblem(ps.id)}
                          >
                            Change
                          </Button>
                        ) : (
                          <Typography color="text.secondary">—</Typography>
                        )
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleSelectProblem(ps.id)}
                        >
                          Select
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {(!problemStatements || problemStatements.length === 0) && (
                <TableRow>
                  <TableCell colSpan={page === "team" ? 5 : 4} align="center">
                    No problem statements available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Confirmation Dialog - for both selection and edit */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>
          {confirmDialog.isEdit ? "Change Problem Statement" : "Select Problem Statement"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.isEdit 
              ? "Are you sure you want to change your problem statement? This can only be done within 4 hours of the hackathon start time."
              : "Are you sure you want to select this problem statement for your team? You will have 4 hours to change your selection if needed."
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color={confirmDialog.isEdit ? "secondary" : "primary"} variant="contained">
            {confirmDialog.isEdit ? "Change Selection" : "Confirm Selection"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Description/Message Dialog (replaces alerts) */}
      <Dialog
        open={descriptionDialog.open}
        onClose={() => setDescriptionDialog({ open: false, description: '' })}
      >
        <DialogTitle>Information</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {descriptionDialog.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDescriptionDialog({ open: false, description: '' })} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProblemStatementsTable;