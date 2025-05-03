import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimeRemaining, updateTimer } from '../features/timerSlice';
import { Paper, Typography, Box, CircularProgress, Container } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const HackathonTimer = ({ onHackathonStart }) => {
  const dispatch = useDispatch();
  const timerState = useSelector((state) => state.timer);
  const timerInterval = useRef(null);
  
  // Fetch time remaining on component mount
  useEffect(() => {
    dispatch(fetchTimeRemaining());
    
    // Set up polling to refresh data from API every 5 minutes
    const pollInterval = setInterval(() => {
      dispatch(fetchTimeRemaining());
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(pollInterval);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [dispatch]);
  
  // Set up the countdown timer
  useEffect(() => {
    // Clear any existing interval
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    // Only start countdown if not already started
    if (!timerState.started) {
      timerInterval.current = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
    } else if (onHackathonStart) {
      // Call the callback when hackathon starts
      onHackathonStart();
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [timerState.started, timerState.remaining, dispatch, onHackathonStart]);
  
  // Handle what to show based on hackathon state
  if (timerState.started) {
    return null; // Return nothing if hackathon has started
  }
  
  const { days, hours, minutes, seconds } = timerState.remaining;
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
          background: 'linear-gradient(120deg, #e0f2fe 0%, #f0f9ff 100%)',
          border: '1px solid rgba(186, 230, 253, 0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0) 70%)',
          zIndex: 0
        }} />
        
        <Typography variant="h5" color="primary" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 600,
          mb: 3
        }}>
          <AccessTimeIcon sx={{ mr: 1 }} />
          Hackathon Countdown
        </Typography>
        
        {timerState.loading && !timerState.lastFetched ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: { xs: 2, sm: 4 },
              flexWrap: 'wrap',
              mb: 3
            }}>
              {/* Time units display */}
              {[
                { value: days, label: 'Days' },
                { value: hours, label: 'Hours' },
                { value: minutes, label: 'Minutes' },
                { value: seconds, label: 'Seconds' }
              ].map((unit) => (
                <Box key={unit.label} sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '80px'
                }}>
                  <Paper
                    elevation={2}
                    sx={{
                      width: '64px',
                      height: '64px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      mb: 1,
                      background: 'white',
                      border: '1px solid rgba(226, 232, 240, 0.8)'
                    }}
                  >
                    <Typography variant="h4" color="text.primary" sx={{ fontWeight: 700 }}>
                      {unit.value}
                    </Typography>
                  </Paper>
                  <Typography variant="body2" color="text.secondary">
                    {unit.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Typography variant="body1" color="text.secondary">
              Get ready! The hackathon will begin once the countdown reaches zero.
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default HackathonTimer;