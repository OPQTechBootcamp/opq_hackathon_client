// src/components/AdminJudgeManagement.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import apiInstance from "../utils/apiInstance";
import { getToken } from "../utils/tokenUtils";
import { useSelector } from 'react-redux';

const authHeader = () => ({ 
  headers: { Authorization: `Bearer ${getToken()}` } 
});

const JudgeManagement = () => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentJudge, setCurrentJudge] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  
  // Check if the current user is an admin
  const isAdmin = user && user.role === "admin";

  const fetchJudges = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiInstance.get('judge', authHeader());
      setJudges(response.data.data);
    } catch (err) {
      console.error('Error fetching judges:', err);
      setError('Failed to load judges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudges();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const viewJudgeDetails = async (id) => {
    try {
      const response = await apiInstance.get(`judge/${id}`, authHeader());
      setCurrentJudge(response.data.data);
      setDetailsOpen(true);
    } catch (err) {
      console.error('Error fetching judge details:', err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!isAdmin) {
      return; // Only allow admin users to update status
    }
    
    setStatusUpdateLoading(true);
    
    try {
      await apiInstance.put('judge/status', 
        { userId: id, status: newStatus }, 
        authHeader()
      );
      
      // Update local state
      setJudges(judges.map(judge => 
        judge.id === id ? { ...judge, status: newStatus } : judge
      ));
      
      if (currentJudge && currentJudge.id === id) {
        setCurrentJudge({ ...currentJudge, status: newStatus });
      }
      
    } catch (err) {
      console.error('Error updating judge status:', err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleClose = () => {
    setDetailsOpen(false);
  };

  const filteredJudges = judges.filter(judge => {
    // Filter by status tab
    const statusMatch = 
      (tabValue === 0) || // All
      (tabValue === 1 && judge.status === 'pending') || // Pending
      (tabValue === 2 && judge.status === 'approved') || // Approved
      (tabValue === 3 && judge.status === 'rejected'); // Rejected
    
    // Filter by search query
    const searchMatch = 
      judge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judge.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judge.current_company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judge.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 5, mb: 5, p: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Judge Management
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchJudges}
          >
            Refresh
          </Button>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label={`All (${judges.length})`} />
            <Tab label={`Pending (${judges.filter(j => j.status === 'pending').length})`} />
            <Tab label={`Approved (${judges.filter(j => j.status === 'approved').length})`} />
            <Tab label={`Rejected (${judges.filter(j => j.status === 'rejected').length})`} />
          </Tabs>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex' }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
            variant="outlined"
            size="small"
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : filteredJudges.length === 0 ? (
          <Typography align="center" sx={{ my: 3 }}>No judges found</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJudges.map((judge) => (
                  <TableRow key={judge.id} hover>
                    <TableCell>{judge.name}</TableCell>
                    <TableCell>{judge.email}</TableCell>
                    <TableCell>{judge.current_company}</TableCell>
                    <TableCell>{judge.total_experience} Years</TableCell>
                    <TableCell>
                      <Chip 
                        label={judge.status.charAt(0).toUpperCase() + judge.status.slice(1)} 
                        color={getStatusColor(judge.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          color="primary"
                          onClick={() => viewJudgeDetails(judge.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Only show approve/reject buttons for admin users */}
                      {isAdmin && judge.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton 
                              color="success"
                              onClick={() => handleStatusUpdate(judge.user_id, 'approved')}
                              disabled={statusUpdateLoading}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Reject">
                            <IconButton 
                              color="error"
                              onClick={() => handleStatusUpdate(judge.user_id, 'rejected')}
                              disabled={statusUpdateLoading}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Judge Details Dialog */}
        <Dialog 
          open={detailsOpen} 
          onClose={handleClose}
          maxWidth="md"
          fullWidth
        >
          {currentJudge && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Judge Profile</Typography>
                  <Chip 
                    label={currentJudge.status.charAt(0).toUpperCase() + currentJudge.status.slice(1)} 
                    color={getStatusColor(currentJudge.status)}
                  />
                </Box>
              </DialogTitle>
              
              <DialogContent dividers>
                <Grid container spacing={3}>
                  {/* Personal Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.name}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.email}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          WhatsApp Number
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.whatsapp_number}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Industry
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.industry}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* Professional Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Professional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Experience
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.total_experience} Years
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Current Company
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.current_company}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Job Title
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.job_title}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          LinkedIn Profile
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.linkedin_url ? (
                            <a href={currentJudge.linkedin_url} target="_blank" rel="noopener noreferrer">
                              View Profile
                            </a>
                          ) : 'Not provided'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bio
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fafafa' }}>
                          <Typography variant="body2">
                            {currentJudge.bio}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* Hackathon Preferences */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Hackathon Preferences
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Area of Expertise
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.area_of_expertise}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Preferred Evaluation Days
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.preferred_evaluation_days || 'Not specified'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Preferred Time Slot
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.preferred_time_slot || 'Not specified'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Dietary Preference
                        </Typography>
                        <Typography variant="body1">
                          {currentJudge.dietary_preference || 'Not specified'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions>
                {/* Only show the approval/rejection buttons for admin users */}
                {isAdmin && (
                  <>
                    {currentJudge.status === 'pending' && (
                      <>
                        <Button 
                          variant="contained"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleStatusUpdate(currentJudge.user_id, 'approved')}
                          disabled={statusUpdateLoading}
                        >
                          Approve
                        </Button>
                        
                        <Button 
                          variant="contained"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => handleStatusUpdate(currentJudge.user_id, 'rejected')}
                          disabled={statusUpdateLoading}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {currentJudge.status === 'approved' && (
                      <Button 
                        variant="contained"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleStatusUpdate(currentJudge.user_id, 'rejected')}
                        disabled={statusUpdateLoading}
                      >
                        Reject
                      </Button>
                    )}
                    
                    {currentJudge.status === 'rejected' && (
                      <Button 
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleStatusUpdate(currentJudge.user_id, 'approved')}
                        disabled={statusUpdateLoading}
                      >
                        Approve
                      </Button>
                    )}
                  </>
                )}
                
                <Button onClick={handleClose}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Paper>
    </Container>
  );
};

export default JudgeManagement;