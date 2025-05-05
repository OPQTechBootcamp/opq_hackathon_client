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
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Stack
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeamDashboard,
} from "../features/teamDashboard/teamDashboardSlice";
import InfoIcon from "@mui/icons-material/Info";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ClassIcon from "@mui/icons-material/Class";
import CodeIcon from "@mui/icons-material/Code";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import ProblemStatementsTable from "../components/ProblemStatementsTable";
import TeamProfileForm from "../components/ProfileCreation";

const TeamDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const { team, loading, success, error } =
    useSelector((state) => state.teamDashboard);

  const { id, team_name } = useSelector((state) => state.team.team);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchTeamDashboard({ id, team_name }));
  }, [dispatch, id, team_name]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => dispatch(fetchTeamDashboard({ id, team_name })), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch, id, team_name]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchTeamDashboard({ id, team_name })).then(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };

  // Generate initials for avatar
  const getTeamInitials = (name) => {
    if (!name) return "T";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Generate a consistent color based on team name
  const getAvatarColor = (name) => {
    if (!name) return theme.palette.primary.main;
    
    const colors = [
      '#3f51b5', '#f44336', '#009688', '#ff9800', 
      '#9c27b0', '#2196f3', '#4caf50', '#ff5722'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #2196f3 0%, #3f51b5 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(255,255,255,0.05)',
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
              zIndex: 0
            }}
          />
          
          <Grid container spacing={2} alignItems="center" position="relative" zIndex={1}>
            <Grid item>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: getAvatarColor(team?.team_name), 
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}
              >
                {getTeamInitials(team?.team_name)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold">
                Team Dashboard
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Welcome back, {team?.team_name || "Team"}
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh dashboard">
                  <Button 
                    variant="contained" 
                    color="info"
                    onClick={handleRefresh}
                    startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                    disabled={refreshing}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                    }}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </Tooltip>
                <Button 
                  onClick={() => setOpenProfileDialog(true)} 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  color="warning"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                  }}
                >
                 Member Profile
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Dialog
          open={openProfileDialog}
          onClose={() => setOpenProfileDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            pb: 1
          }}>
            Complete Your Team Profile
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TeamProfileForm closeDialog={() => setOpenProfileDialog(false)} />
          </DialogContent>
        </Dialog>

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {error}
          </Alert>
        )}
        
        {loading && !refreshing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {team && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    color="primary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      pb: 1,
                      mb: 2
                    }}
                  >
                    <InfoIcon sx={{ mr: 1 }} /> Team Information
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BadgeIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Team Name</Typography>
                        <Typography variant="body1" fontWeight="medium">{team.team_name}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Team Email</Typography>
                        <Typography variant="body1">{team.team_email}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SupervisorAccountIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Judge/POC</Typography>
                        <Typography variant="body1">{team.judge_name || "Not assigned"}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ClassIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Series</Typography>
                        <Typography variant="body1">{team.section || "Not assigned"}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CodeIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Team Code</Typography>
                        <Chip 
                          label={team.section_team_id || "N/A"} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    color="primary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      pb: 1,
                      mb: 2
                    }}
                  >
                    <PeopleIcon sx={{ mr: 1 }} /> Team Members
                  </Typography>
                  
                  {team.team_members ? (
                    <Grid container spacing={2}>
                      {Object.entries(team.team_members).map(([key, value], index) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              p: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              bgcolor: index % 2 === 0 ? 'rgba(33, 150, 243, 0.05)' : 'transparent'
                            }}
                          >
                            <Avatar 
                              sx={{ 
                                bgcolor: theme.palette.primary.light,
                                width: 32,
                                height: 32,
                                mr: 1.5,
                                fontSize: '0.875rem'
                              }}
                            >
                              {value.substring(0, 1).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2">{value}</Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No team members added yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'medium'
          }}
        >
          <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          Problem Statements
        </Typography>

        <ProblemStatementsTable page="team" />

        {!team && !loading && !error && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            No team data available. Please ensure you are logged in.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default TeamDashboard;