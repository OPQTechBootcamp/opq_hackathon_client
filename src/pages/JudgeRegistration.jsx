// src/components/JudgeRegistration.jsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Divider,
  FormHelperText,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import apiInstance from "../utils/apiInstance";

const JudgeRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp_number: '',
    industry: 'IT',
    total_experience: '',
    current_company: '',
    job_title: '',
    linkedin_url: '',
    bio: '',
    area_of_expertise: '',
    preferred_evaluation_days: '',
    preferred_time_slot: '',
    dietary_preference: ''
  });

  // State for the modal
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [modalErrors, setModalErrors] = useState({});

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle modal input changes
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData({
      ...modalData,
      [name]: value
    });
    
    // Clear error when field is modified
    if (modalErrors[name]) {
      setModalErrors({
        ...modalErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    // Email validation removed as it will be collected in the modal
    
    // Password validation removed as it will be collected in the modal
    
    if (!formData.whatsapp_number.trim()) {
      newErrors.whatsapp_number = 'WhatsApp number is required';
    } else if (!/^\d{10}$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = 'Please enter a valid 10-digit number';
    }
    
    if (!formData.total_experience) newErrors.total_experience = 'Total experience is required';
    if (!formData.current_company.trim()) newErrors.current_company = 'Current company is required';
    if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
    
    if (formData.linkedin_url.trim() && !formData.linkedin_url.includes('linkedin.com')) {
      newErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else {
      // More accurate word count calculation
      const wordCount = formData.bio.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount < 10 || wordCount > 50) {
        newErrors.bio = 'Bio should be between 10-50 words';
      }
    }
    
    if (!formData.area_of_expertise.trim()) newErrors.area_of_expertise = 'Area of expertise is required';
    
    if (!formData.preferred_evaluation_days) newErrors.preferred_evaluation_days = 'Please select your preferred evaluation day(s)';
    if (!formData.preferred_time_slot) newErrors.preferred_time_slot = 'Please select your preferred time slot';
    if (!formData.dietary_preference) newErrors.dietary_preference = 'Please select your dietary preference';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateModalData = () => {
    const newErrors = {};
    
    if (!modalData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(modalData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!modalData.password) {
      newErrors.password = 'Password is required';
    } else if (modalData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (modalData.password !== modalData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setModalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Open the modal for email and password collection
    setOpenModal(true);
  };

  const handleModalSubmit = async () => {
    if (!validateModalData()) return;
    
    setIsSubmitting(true);
    
    try {
      // Combine form data with modal data
      const finalFormData = {
        ...formData,
        email: modalData.email,
        password: modalData.password
      };
      
      const response = await apiInstance.post('/judge/register', finalFormData);
      
      setSnackbar({
        open: true,
        message: 'Registration successful! Redirecting to login page...',
        severity: 'success'
      });
      
      // Close the modal
      setOpenModal(false);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        whatsapp_number: '',
        industry: 'IT',
        total_experience: '',
        current_company: '',
        job_title: '',
        linkedin_url: '',
        bio: '',
        area_of_expertise: '',
        preferred_evaluation_days: '',
        preferred_time_slot: '',
        dietary_preference: ''
      });
      
      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        severity: 'error'
      });
      
      // Close the modal on error
      setOpenModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalData({
      email: '',
      password: '',
      confirmPassword: ''
    });
    setModalErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate word count more accurately
  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  // Add custom styling for form elements
  const selectSX = {
    minWidth: 200, // or whatever fits
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.87)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1976d2',
    }
  };
  

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 5, mb: 5, p: { xs: 2, md: 4 } }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            <GavelIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
            Judge Registration Form
          </Typography>
        </Box>

        {/* Event information card */}
        <Card sx={{ mb: 4, backgroundColor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              <EmojiEventsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Code Braker Challenge
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color="text.secondary">
                  <CalendarMonthIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                  Date: 10th & 11th May 2025
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color="text.secondary">
                  <LocationOnIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                  Location: Aditya Layout, Rajarajeshwari Nagar, Bengaluru, Karnataka 560098
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography variant="h6" gutterBottom>
                📢 Instructions:
              </Typography>
              <ul style={{ marginLeft: '20px' }}>
                <li>Must have 6+ years of experience in IT (any domain).</li>
                <li>Evaluation guidelines will be shared in advance.</li>
                <li>Transportation allowance will be provided by the organizing company.</li>
                <li>Event timings will be communicated via WhatsApp.</li>
              </ul>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                🎁 Perks of Being a Judge:
              </Typography>
              <ul style={{ marginLeft: '20px' }}>
                <li>Stay updated with the latest in AI, ML, and emerging tech trends</li>
                <li>Enhance your LinkedIn profile with this prestigious opportunity</li>
                <li>Network with top professionals and budding innovators</li>
                <li>Re-experience the vibrant college hackathon atmosphere</li>
                <li>Share your knowledge and engage with Gen Z talent</li>
              </ul>
            </Box>
          </CardContent>
        </Card>

        <form onSubmit={handleFormSubmit}>
          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Personal Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="WhatsApp Number"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                error={!!errors.whatsapp_number}
                helperText={errors.whatsapp_number}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel id="industry-label">Industry</InputLabel>
                <Select
                  labelId="industry-label"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  label="Industry"
                  sx={selectSX}
                >
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Non-IT">Non-IT</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Professional Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.total_experience} variant="outlined">
                <InputLabel id="total-experience-label">Total Experience</InputLabel>
                <Select
                  labelId="total-experience-label"
                  name="total_experience"
                  value={formData.total_experience}
                  onChange={handleChange}
                  label="Total Experience"
                  sx={selectSX}
                >
                  {/* Removed 5 Years option since requirement is 6+ years */}
                  <MenuItem value="6">6 Years</MenuItem>
                  <MenuItem value="7">7 Years</MenuItem>
                  <MenuItem value="8">8 Years</MenuItem>
                  <MenuItem value="9">9 Years</MenuItem>
                  <MenuItem value="10+">10+ Years</MenuItem>
                </Select>
                {errors.total_experience && (
                  <FormHelperText>{errors.total_experience}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Current Company"
                name="current_company"
                value={formData.current_company}
                onChange={handleChange}
                error={!!errors.current_company}
                helperText={errors.current_company}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Job Title / Designation"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                error={!!errors.job_title}
                helperText={errors.job_title}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile URL"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                error={!!errors.linkedin_url}
                helperText={errors.linkedin_url}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Short Bio (10-50 words)"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                error={!!errors.bio}
                helperText={errors.bio || `${getWordCount(formData.bio)} words`}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Hackathon Preferences
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Area of Expertise"
                name="area_of_expertise"
                placeholder="e.g., AI/ML, Cloud, DevOps, Cybersecurity, UI/UX..."
                value={formData.area_of_expertise}
                onChange={handleChange}
                error={!!errors.area_of_expertise}
                helperText={errors.area_of_expertise}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required error={!!errors.preferred_evaluation_days} variant="outlined">
                <InputLabel id="preferred-evaluation-days-label">Preferred Evaluation Day(s)</InputLabel>
                <Select
                  labelId="preferred-evaluation-days-label"
                  name="preferred_evaluation_days"
                  value={formData.preferred_evaluation_days}
                  onChange={handleChange}
                  label="Preferred Evaluation Day(s)"
                  sx={selectSX}
                >
                  <MenuItem value="Day 1">Day 1 – May 10</MenuItem>
                  <MenuItem value="Day 2">Day 2 – May 11</MenuItem>
                  <MenuItem value="Both Days">Both Days</MenuItem>
                </Select>
                {errors.preferred_evaluation_days && (
                  <FormHelperText>{errors.preferred_evaluation_days}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required error={!!errors.preferred_time_slot} variant="outlined">
                <InputLabel id="preferred-time-slot-label">Preferred Time Slot</InputLabel>
                <Select
                  labelId="preferred-time-slot-label"
                  name="preferred_time_slot"
                  value={formData.preferred_time_slot}
                  onChange={handleChange}
                  label="Preferred Time Slot"
                  sx={selectSX}
                >
                  <MenuItem value="Morning">Morning</MenuItem>
                  <MenuItem value="Afternoon">Afternoon</MenuItem>
                  <MenuItem value="Full Day">Full Day</MenuItem>
                </Select>
                {errors.preferred_time_slot && (
                  <FormHelperText>{errors.preferred_time_slot}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required error={!!errors.dietary_preference} variant="outlined">
                <InputLabel id="dietary-preference-label">Dietary Preference</InputLabel>
                <Select
                  labelId="dietary-preference-label"
                  name="dietary_preference"
                  value={formData.dietary_preference}
                  onChange={handleChange}
                  label="Dietary Preference"
                  sx={selectSX}
                >
                  <MenuItem value="Veg">Veg</MenuItem>
                  <MenuItem value="Jain">Jain</MenuItem>
                </Select>
                {errors.dietary_preference && (
                  <FormHelperText>{errors.dietary_preference}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Join Judge Panel'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Registration Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Complete Your Registration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide your email and create a password to complete the registration.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={modalData.email}
            onChange={handleModalChange}
            error={!!modalErrors.email}
            helperText={modalErrors.email}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={modalData.password}
            onChange={handleModalChange}
            error={!!modalErrors.password}
            helperText={modalErrors.password}
          />
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
            value={modalData.confirmPassword}
            onChange={handleModalChange}
            error={!!modalErrors.confirmPassword}
            helperText={modalErrors.confirmPassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleModalSubmit} 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default JudgeRegistration;