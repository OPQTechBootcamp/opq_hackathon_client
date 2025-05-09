// src/components/JudgeProfile.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  Alert,
  Skeleton,
  Link,
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  LinkedIn as LinkedInIcon,
  EmojiEvents as EmojiEventsIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Restaurant as RestaurantIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import apiInstance from "../utils/apiInstance";
import { getToken } from "../utils/tokenUtils";

const JudgeProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJudgeProfile = async () => {
      try {
        setLoading(true);
        
        const authHeader = { headers: { Authorization: `Bearer ${getToken()}` } };
        const response = await apiInstance.get(`/judge/${user.id}`, authHeader);
        
        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          setError('Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Error fetching judge profile:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching your profile');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchJudgeProfile();
    }
  }, [user]);

  const getStatusChip = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', label: 'Pending Approval' },
      'approved': { color: 'success', label: 'Approved' },
      'rejected': { color: 'error', label: 'Rejected' },
      'inactive': { color: 'default', label: 'Inactive' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Chip 
        color={config.color} 
        label={config.label} 
        size="medium"
        sx={{ fontWeight: 'medium', fontSize: '0.875rem' }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="circular" width={100} height={100} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" height={60} width={250} sx={{ mx: 'auto', mt: 2 }} />
            <Skeleton variant="text" height={30} width={150} sx={{ mx: 'auto' }} />
          </Box>
          <Divider sx={{ my: 3 }} />
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Skeleton variant="text" height={30} width={200} />
              <Skeleton variant="text" height={50} />
            </Box>
          ))}
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md">
        <Alert severity="info" sx={{ mt: 4 }}>
          No profile data available. Please contact support if this issue persists.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, mb: 4 }}>
        {/* Profile Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '3rem'
            }}
          >
            {profile.name?.charAt(0) || '?'}
          </Avatar>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {profile.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              {profile.job_title} at {profile.current_company}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            {getStatusChip(profile.status)}
          </Box>
          
          {profile.linkedin_url && (
            <Button 
              variant="outlined" 
              startIcon={<LinkedInIcon />}
              component={Link}
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mt: 2 }}
            >
              LinkedIn Profile
            </Button>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Personal Information */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Personal Information
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Email
                  </Typography>
                </Box>
                <Typography variant="body1">{profile.email}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    WhatsApp
                  </Typography>
                </Box>
                <Typography variant="body1">{profile.whatsapp_number}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Industry
                  </Typography>
                </Box>
                <Typography variant="body1">{profile.industry}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Experience
                  </Typography>
                </Box>
                <Typography variant="body1">{profile.total_experience} Years</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Professional Bio */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Professional Bio
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="body1" paragraph>
              {profile.bio}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Chip
                label={profile.area_of_expertise}
                color="primary"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
        
        {/* Hackathon Preferences */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Hackathon Preferences
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonthIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Preferred Days
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {profile.preferred_evaluation_days}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Time Slot
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {profile.preferred_time_slot}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Dietary Preference
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {profile.dietary_preference}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Event Information */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Event Information
        </Typography>
        
        <Card 
          variant="outlined" 
          sx={{ 
            mb: 4, 
            backgroundColor: profile.status === 'approved' ? '#f1f8e9' : 'inherit'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmojiEventsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Code Braker Challenge
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 1 }}>
              <CalendarMonthIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
              Date: 10th & 11th May 2025
            </Typography>
            
            <Typography variant="body1">
              <LocationOnIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
              Location: Global Academy of Technology, Aditya Layout, Rajarajeshwari Nagar, Bengaluru, Karnataka 560098
            </Typography>
            
            {profile.status === 'approved' ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                Your registration has been approved! You will receive further details via WhatsApp.
              </Alert>
            ) : profile.status === 'pending' ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Your registration is pending approval. We'll notify you once it's approved.
              </Alert>
            ) : profile.status === 'rejected' ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                Unfortunately, your registration was not approved. Please contact the organizers for more information.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Your account is currently inactive. Please contact support.
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {/* Registration Information */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Registration Information
        </Typography>
        
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Registration Date:
                </Typography>
                <Typography variant="body1">
                  {formatDate(profile.created_at)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Status:
                </Typography>
                <Typography variant="body1">
                  {getStatusChip(profile.status)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default JudgeProfile;