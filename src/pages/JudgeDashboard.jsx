import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedTeams, submitEvaluation, fetchAllTeamsRatings, clearStatus } from '../features/judgeDashboard/judgeDashboardSlice';
import {
  Container, Typography, Card, CardContent, Button, Box, Alert, CircularProgress,
  Tabs, Tab, MenuItem, Select, FormControl, InputLabel, Grid, Chip, Divider,
  Paper, Stack, useTheme, useMediaQuery, styled
} from '@mui/material';
import EvaluationFormModal from '../components/EvaluationFormModal';
import AllTeamsRatingsTable from '../components/AllTeamsRatingsTable';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Styled components for responsive tabs
const ResponsiveTab = styled(Tab)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    padding: theme.spacing(1),
    fontSize: theme.typography.pxToRem(12),
  },
}));

const JudgeDashboard = () => {
  const dispatch = useDispatch();
  const { assignedTeams, loading, error, success } = useSelector((state) => state.judgeDashboard);
  const judge = useSelector((state) => state.auth.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [openModal, setOpenModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  
  // Extract team groups from the team_code (e.g., "A_1" -> "A", "C_1" -> "C")
  const extractTeamGroup = (teamCode) => {
    return teamCode?.split('_')[0] || 'Unknown';
  };
  
  // Get unique team groups
  const getTeamGroups = () => {
    const groups = assignedTeams.map(team => extractTeamGroup(team.team_code));
    return [...new Set(groups)].sort();
  };
  
  const teamGroups = getTeamGroups();
  
  useEffect(() => {
    if (judge?.id) {
      dispatch(fetchAssignedTeams(judge.id));
      dispatch(fetchAllTeamsRatings());
    }
    
    // Set default active group if available
    if (teamGroups.length > 0 && !activeGroup) {
      setActiveGroup(teamGroups[0]);
    }
  }, [judge, dispatch, teamGroups.length, activeGroup]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Handle round selection for evaluation
  const handleRoundSelect = (team, roundId) => {
    setSelectedTeam(team);
    setSelectedRound(roundId);
    setOpenModal(true);
  };

  const handleFormSubmit = async (evaluationData) => {
    if (selectedTeam && judge?.id && selectedRound) {
      const evaluationWithIds = {
        ...evaluationData,
        team_id: selectedTeam.team_id,
        judge_id: judge.id,
        round_id: selectedRound,
      };
      
      try {
        // Wait for the submission to complete
        await dispatch(submitEvaluation(evaluationWithIds)).unwrap();
        
        // Only fetch updated data after successful submission
        dispatch(fetchAllTeamsRatings());
        dispatch(fetchAssignedTeams(judge.id));
        setOpenModal(false);
      } catch (error) {
        console.error("Failed to submit evaluation:", error);
        // Handle error if needed
      }
    }
  };

  const handleGroupChange = (event, newGroup) => {
    setActiveGroup(newGroup);
  };

  // Get teams for the active group
  const getFilteredTeams = () => {
    return assignedTeams.filter(team => extractTeamGroup(team.team_code) === activeGroup);
  };
  
  const filteredTeams = getFilteredTeams();
  
  // Calculate evaluation progress
  const getTeamProgress = (team) => {
    if (!team.rounds) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = team.rounds.filter(round => round.evaluated).length;
    const total = team.rounds.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  // Check if a round is evaluated
  const isRoundEvaluated = (round) => {
    return round.evaluated || false;
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Judge Dashboard
        </Typography>
        <Divider />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Assigned Teams Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 5, 
          borderRadius: 2,
          background: `linear-gradient(to right, ${theme.palette.primary.light}22, ${theme.palette.background.paper})` 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AssignmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight="bold">
            Assigned Teams
          </Typography>
        </Box>

        {/* Team Groups Tabs - Enhanced for Mobile */}
        {teamGroups.length > 0 ? (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeGroup} 
              onChange={handleGroupChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 3 }}
            >
              {teamGroups.map((group) => (
                <ResponsiveTab 
                  key={group} 
                  label={isMobile ? `Grp ${group}` : `Group ${group}`} 
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
        ) : (
          <Typography>No team groups available</Typography>
        )}

        {/* Teams in Selected Group */}
        <Grid container spacing={2}>
          {filteredTeams.map((team) => {
            const progress = getTeamProgress(team);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={team.team_id}>
                <Card 
                  elevation={4} 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Team Code - Highlighted */}
                    <Box 
                      sx={{ 
                        display: 'inline-block', 
                        mb: 2, 
                        py: 1, 
                        px: 2, 
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        borderRadius: 2,
                        boxShadow: 1,
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.8rem' : 'inherit'
                      }}
                    >
                      Team Code: {team.team_code}
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        fontWeight="bold"
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mb: 0.5 
                        }}
                      >
                        <SchoolIcon 
                          sx={{ 
                            mr: 1, 
                            color: theme.palette.primary.main,
                            fontSize: isMobile ? '0.7rem' : 'inherit'
                          }} 
                        />
                        Team name: {team.team_name}
                      </Typography>
                      
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{
                          fontSize: isMobile ? '1.0rem' : 'inherit'
                        }}
                      >
                        Problem Statement: {team.problem_statement_title}
                      </Typography>
                    </Box>
                    
                    {/* Progress Bar */}
                    <Box sx={{ mt: 2, mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Evaluation Progress: 
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {progress.completed}/{progress.total} Rounds
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: 8, 
                          bgcolor: theme.palette.grey[200],
                          borderRadius: 5,
                          overflow: 'hidden'
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: `${progress.percentage}%`, 
                            height: '100%', 
                            bgcolor: progress.percentage === 100 ? 
                              theme.palette.success.main : theme.palette.primary.main,
                            transition: 'width 1s ease-in-out'
                          }} 
                        />
                      </Box>
                    </Box>
                    
                    {/* Round Selection Dropdown */}
                    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                      <InputLabel>Select Round to Evaluate</InputLabel>
                      <Select
                        label="Select Round to Evaluate"
                        value=""
                        onChange={(e) => handleRoundSelect(team, e.target.value)}
                        sx={{ borderRadius: 2 }}
                        size={isMobile ? "small" : "medium"}
                      >
                        {team.rounds && team.rounds.map((round) => (
                          <MenuItem 
                            key={round.id} 
                            value={round.id}
                            disabled={isRoundEvaluated(round)}
                          >
                            {round.title}
                            {isRoundEvaluated(round) && (
                              <Chip 
                                label="Evaluated" 
                                color="success" 
                                size="small" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* All Teams Ratings */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          All Teams Ratings
        </Typography>
        <AllTeamsRatingsTable />
      </Paper>

      {/* Evaluation Form Modal */}
      <EvaluationFormModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        team={selectedTeam}
        roundId={selectedRound}
        onSubmit={handleFormSubmit}
      />
    </Container>
  );
};

export default JudgeDashboard;