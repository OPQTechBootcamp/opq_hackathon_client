import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllTeamsRatings } from "../features/judgeDashboard/judgeDashboardSlice";
import {
  Typography,
  Button,
  Box,
  LinearProgress,
  styled,
  Toolbar,
  AppBar,
  IconButton,
  Tooltip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Chip,
  useTheme
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import apiInstance from "../utils/apiInstance";
import { getToken } from "../utils/tokenUtils";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  whiteSpace: "nowrap",
  padding: "16px 12px",
}));

// Regular table cell with nowrap for better horizontal scrolling
const StyledRegularCell = styled(TableCell)({
  whiteSpace: "nowrap",
});

const AdminResultsScreen = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { allTeamsRatings, loading } = useSelector((state) => state.judgeDashboard);
  
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeGroup, setActiveGroup] = useState("all");

  // Extract unique team groups
  const getTeamGroups = () => {
    if (!allTeamsRatings || allTeamsRatings.length === 0) return ["all"];
    
    const groups = allTeamsRatings.map(team => 
      team.team_code?.split('_')[0] || team.team_group || 'Unknown'
    );
    return ['all', ...new Set(groups)].filter(Boolean);
  };
  
  const teamGroups = getTeamGroups();

  useEffect(() => {
    dispatch(fetchAllTeamsRatings());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAllTeamsRatings());
  };

  const fetchTeamDetails = async (teamId) => {
    setLoadingDetails(true);
    try {
      const { data } = await apiInstance.get(`results/${teamId}`, authHeader());
      setEvaluationDetails(data);
    } catch (err) {
      console.error("Error fetching team results:", err);
      setEvaluationDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenDialog = (team) => {
    setSelectedTeam(team);
    fetchTeamDetails(team.team_id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEvaluationDetails([]);
  };

  const handleGroupChange = (event, newGroup) => {
    setActiveGroup(newGroup);
  };

  const getDisplayRating = (rating) => {
    return rating !== null && rating !== undefined && rating !== "NA" 
      ? parseFloat(rating).toFixed(2) 
      : "Not Available";
  };

  const getRatingColor = (rating) => {
    if (!rating || rating === "NA") return theme.palette.text.secondary;
    const numRating = parseFloat(rating);
    if (numRating >= 8) return theme.palette.success.main;
    if (numRating >= 6) return theme.palette.primary.main;
    if (numRating >= 4) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Filter and sort teams
  const getFilteredAndSortedTeams = () => {
    if (!allTeamsRatings) return [];
    
    let filteredTeams = [...allTeamsRatings];
    
    // Filter by group
    if (activeGroup !== "all") {
      filteredTeams = filteredTeams.filter(team => {
        const teamGroup = team.team_code?.split('_')[0] || team.team_group;
        return teamGroup === activeGroup;
      });
    }
    
    // Sort by average rating (descending)
    return filteredTeams.sort((a, b) => {
      const ratingA = a.average_rating === null || a.average_rating === undefined ? -Infinity : parseFloat(a.average_rating);
      const ratingB = b.average_rating === null || b.average_rating === undefined ? -Infinity : parseFloat(b.average_rating);
      return ratingB - ratingA;
    });
  };

  const filteredAndSortedTeams = getFilteredAndSortedTeams();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <AppBar position="static" color="default" elevation={0} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
          <Toolbar>
            <Typography variant="h5" color="inherit" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Hackathon Leaderboard
            </Typography>
            <Tooltip title="Refresh Leaderboard">
              <IconButton
                onClick={handleRefresh}
                color="primary"
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        
        {/* Group Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeGroup}
            onChange={handleGroupChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {teamGroups.map((group) => (
              <Tab 
                key={group} 
                label={group === 'all' ? 'All Groups' : `Group ${group}`} 
                value={group}
                sx={{ 
                  fontWeight: 'bold',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  }
                }}
              />
            ))}
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <LinearProgress sx={{ width: "50%" }} />
          </Box>
        ) : (
          <TableContainer 
            component={Paper} 
            elevation={2} 
            sx={{ 
              borderRadius: 2, 
              overflow: 'auto',
              maxWidth: '100%',
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.grey[300],
                borderRadius: '4px',
              }
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Rank</StyledTableCell>
                  <StyledTableCell>Team Code</StyledTableCell>
                  <StyledTableCell>Team Name</StyledTableCell>
                  <StyledTableCell>Problem Statement</StyledTableCell>
                  <StyledTableCell align="center">Rating</StyledTableCell>
                  <StyledTableCell align="center">Rounds Evaluated</StyledTableCell>
                  <StyledTableCell>Judges</StyledTableCell>
                  <StyledTableCell align="center">Details</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedTeams.map((team, index) => {
                  // Parse rounds and judges
                  const rounds = team.rounds ? team.rounds.split(',').map(r => r.trim()) : [];
                  const judges = team.judge_names ? team.judge_names.split(',').map(j => j.trim()) : [];
                  
                  return (
                    <TableRow 
                      key={team.team_id}
                      hover
                      sx={{ 
                        '&:nth-of-type(odd)': { 
                          backgroundColor: theme.palette.action.hover 
                        }
                      }}
                    >
                      <StyledRegularCell>
                        <Chip 
                          label={index + 1} 
                          color={index < 3 ? "primary" : "default"}
                          sx={{ 
                            fontWeight: 'bold',
                            minWidth: '36px'
                          }}
                        />
                      </StyledRegularCell>
                      <StyledRegularCell>
                        <Chip
                          label={team.team_code}
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </StyledRegularCell>
                      <StyledRegularCell>{team.team_name}</StyledRegularCell>
                      <StyledRegularCell>{team.problem_statement_title}</StyledRegularCell>
                      <StyledRegularCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: getRatingColor(team.average_rating),
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {getDisplayRating(team.average_rating)}
                            {team.average_rating && parseFloat(team.average_rating) > 0 && (
                              <StarIcon sx={{ fontSize: 16, ml: 0.5, color: getRatingColor(team.average_rating) }} />
                            )}
                          </Typography>
                        </Box>
                      </StyledRegularCell>
                      <StyledRegularCell align="center">
                        {rounds.length > 0 ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                            {rounds.map((round, idx) => (
                              <Chip 
                                key={idx} 
                                label={`R${round}`} 
                                size="small" 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">None</Typography>
                        )}
                      </StyledRegularCell>
                      <StyledRegularCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {judges.length > 0 ? (
                            judges.map((judge, idx) => (
                              <Chip
                                key={idx}
                                label={judge}
                                size="small"
                                variant="outlined"
                                sx={{ my: 0.2 }}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not Assigned
                            </Typography>
                          )}
                        </Box>
                      </StyledRegularCell>
                      <StyledRegularCell align="center">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleOpenDialog(team)}
                          disabled={loadingDetails && selectedTeam?.team_id === team.team_id}
                          sx={{ borderRadius: 6 }}
                        >
                          Details
                        </Button>
                      </StyledRegularCell>
                    </TableRow>
                  );
                })}
                {filteredAndSortedTeams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">No teams available in this group.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          fullWidth 
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ 
            backgroundColor: theme.palette.primary.main, 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6">
              {loadingDetails
                ? "Loading Evaluation Details..."
                : `Evaluation Details for ${selectedTeam?.team_name} (${selectedTeam?.team_code})`}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ mt: 2, p: 3 }}>
            {loadingDetails ? (
              <LinearProgress />
            ) : evaluationDetails.length > 0 ? (
              <TableContainer 
                component={Paper} 
                elevation={2} 
                sx={{ 
                  borderRadius: 2, 
                  overflow: 'auto',
                  maxWidth: '100%',
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.grey[300],
                    borderRadius: '4px',
                  }
                }}
              >
                <Table aria-label="evaluation details" size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Round</StyledTableCell>
                      <StyledTableCell>Judge</StyledTableCell>
                      <StyledTableCell>Total Score</StyledTableCell>
                      <StyledTableCell>Innovation</StyledTableCell>
                      <StyledTableCell>Technical</StyledTableCell>
                      <StyledTableCell>Relevance</StyledTableCell>
                      <StyledTableCell>Feasibility</StyledTableCell>
                      <StyledTableCell>Design</StyledTableCell>
                      <StyledTableCell>Collaboration</StyledTableCell>
                      <StyledTableCell>Presentation</StyledTableCell>
                      <StyledTableCell>Bonus</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evaluationDetails.map((evalItem, idx) => (
                      <TableRow key={idx}>
                        <StyledRegularCell>{`R${evalItem.round_number}`}</StyledRegularCell>
                        <StyledRegularCell>{evalItem.judge_name}</StyledRegularCell>
                        <StyledRegularCell sx={{ fontWeight: 'bold' }}>{evalItem.total_score}</StyledRegularCell>
                        <StyledRegularCell>{evalItem.innovation}</StyledRegularCell>
                        <StyledRegularCell>{evalItem.technical}</StyledRegularCell>
                        <StyledRegularCell>{evalItem.relevance}</StyledRegularCell>
                        <StyledRegularCell>{evalItem.feasibility}</StyledRegularCell>
                        <StyledRegularCell>{evalItem.design}</StyledRegularCell>
                        <StyledRegularCell>{evalItem.collaboration}</StyledRegularCell>
                        <StyledRegularCell>{evalItem.presentation}</StyledRegularCell>
                        <StyledRegularCell>{evalItem.bonus}</StyledRegularCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No evaluation details available for this team.</Typography>
            )}
            
            {/* Comments Section */}
            {evaluationDetails.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Judge Comments</Typography>
                {evaluationDetails.map((evalItem, idx) => (
                  <Paper key={idx} elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {evalItem.judge_name} (Round {evalItem.round_number})
                    </Typography>
                    <Typography variant="body2">
                      {evalItem.comment || "No comment provided."}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button 
                onClick={handleCloseDialog} 
                variant="contained"
                color="primary"
                sx={{ borderRadius: 6, px: 3 }}
              >
                Close
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminResultsScreen;