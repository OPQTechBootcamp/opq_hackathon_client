import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Typography, Button, Stack, Box, Card, CardContent,
    createTheme, ThemeProvider, Paper, CircularProgress, Divider, Avatar, useMediaQuery, Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fetchTimeRemaining, updateTimer } from '../features/timerSlice'; 

// Enhanced Custom Theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#2563eb', // Vibrant blue
            light: '#3b82f6',
            dark: '#1d4ed8',
        },
        secondary: {
            main: '#f59e0b', // Warm amber
            light: '#fbbf24',
            dark: '#d97706',
        },
        background: {
            default: '#f8fafc', // Very light blue-gray
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b', // Slate 800
            secondary: '#64748b', // Slate 500
        },
        success: {
            main: '#10b981', // Emerald
        },
        info: {
            main: '#0ea5e9', // Sky
        },
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h1: {
            fontWeight: 800,
            letterSpacing: '-0.025em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.025em',
        },
        h3: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
        },
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h5: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
            marginBottom: '0.75rem',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '-0.005em',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.7,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: '#64748b',
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 20px 25px -5px rgba(0,0,0,0.05)',
                    borderRadius: 12,
                    transition: 'all 0.25s ease-in-out',
                    overflow: 'hidden',
                    border: '1px solid rgba(241, 245, 249, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '0.625rem 1.25rem',
                    transition: 'all 0.2s',
                    fontWeight: 600,
                },
                contained: {
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        transform: 'translateY(-1px)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(to right, #2563eb, #3b82f6)',
                },
                containedSecondary: {
                    background: 'linear-gradient(to right, #f59e0b, #fbbf24)',
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: 'rgba(226, 232, 240, 0.8)',
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                },
            },
        },
    },
    shape: {
        borderRadius: 12,
    },
});

const HomePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);
    const teamAuth = useSelector((state) => state.team);
    const timerState = useSelector((state) => state.timer); 
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    // State for the notification when hackathon starts
    const [showStartNotification, setShowStartNotification] = useState(false);
    const [timerInterval, setTimerInterval] = useState(null);

    // Fetch time remaining on component mount
    useEffect(() => {
        dispatch(fetchTimeRemaining());
        
        // Set up polling to refresh data from API every 5 minutes
        const pollInterval = setInterval(() => {
            dispatch(fetchTimeRemaining());
        }, 5 * 60 * 1000); // 5 minutes
        
        return () => {
            clearInterval(pollInterval);
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [dispatch]);
    
    // Set up the countdown timer
    useEffect(() => {
        // Clear any existing interval
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Only start countdown if not already started
        if (!timerState.started) {
            const interval = setInterval(() => {
                dispatch(updateTimer());
            }, 1000);
            setTimerInterval(interval);
        } else {
            setShowStartNotification(true);
        }
        
        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [timerState.started, dispatch]);

    // Close notification handler
    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowStartNotification(false);
    };

    const features = [
        {
            icon: <RocketLaunchIcon />,
            title: 'Seamless Launch',
            description: 'Get your hackathon up and running in minutes with our intuitive platform'
        },
        {
            icon: <EmojiEventsIcon />,
            title: 'Fair Judging',
            description: 'Transparent scoring system ensures all teams receive equal consideration'
        }
    ];

    const sections = [
        {
            title: auth.user?.role ? `${auth.user.role.charAt(0).toUpperCase()}${auth.user.role.slice(1)} Portal` : 'Admin Portal',
            description: 'Powerful tools to manage judges, teams, scoring, and oversee the entire hackathon event.',
            icon: <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />,
            color: '#2563eb',
            buttons: [
                { label: 'Sign In', path: '/login', show: !auth.token || !auth.user, color: 'primary' },
                { label: 'Register User', path: '/admin/register', show: auth.token && auth.user?.role === 'admin', color: 'primary' },
                { label: 'Go to Dashboard', path: `/${auth.user?.role}/dashboard`, show: auth.token && (auth.user?.role === 'admin' || auth.user?.role === 'judge' || auth.user?.role === 'coordinator'), color: 'primary' },
            ].filter(button => button.show),
        },
        {
            title: 'Team Portal',
            description: 'Register your team, collaborate with members, and track your progress throughout the hackathon journey.',
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: '#f59e0b',
            buttons: [
                { label: 'Team Sign In', path: '/team/login', show: !teamAuth.token || !teamAuth.team, color: 'secondary' },
                { label: 'Register Team', path: '/team/register', show: !teamAuth.token || !teamAuth.team, color: 'secondary' },
                { label: 'Team Dashboard', path: '/teamDashboard', show: teamAuth.token && teamAuth.team, color: 'secondary' },
            ].filter(button => button.show),
        },
    ];

    // Render the countdown timer component
    const renderCountdownTimer = () => {
        // Always show the timer, regardless of hackathon status
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
                        {timerState.started ? 'Hackathon In Progress' : 'Hackathon Countdown'}
                    </Typography>
                    
                    {timerState.loading && !timerState.lastFetched ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress color="primary" />
                        </Box>
                    ) : timerState.started ? (
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                            The hackathon has started!
                        </Typography>
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
                                    { value: timerState.remaining.days, label: 'Days' },
                                    { value: timerState.remaining.hours, label: 'Hours' },
                                    { value: timerState.remaining.minutes, label: 'Minutes' },
                                    { value: timerState.remaining.seconds, label: 'Seconds' }
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

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ 
                backgroundColor: theme.palette.background.default, 
                minHeight: '100vh',
                overflowX: 'hidden',
                background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.3) 0%, rgba(241, 245, 249, 1) 100%)'
            }}>
                {/* Hero Section */}
                <Box 
                    sx={{ 
                        position: 'relative',
                        py: { xs: 10, md: 16 },
                        overflow: 'hidden',
                    }}
                >
                    {/* Background elements */}
                    <Box sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 500,
                        height: 500,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0) 70%)',
                        zIndex: 0
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: -100,
                        left: -100,
                        width: 500,
                        height: 500,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0) 70%)',
                        zIndex: 0
                    }} />
                    
                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
                            <Typography 
                                variant="h3" 
                                color="text.primary"
                                sx={{ 
                                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                    mb: 2
                                }}
                            >
                                🚀 Elevate Your Hackathon Experience
                            </Typography>
                            <Typography 
                                variant="h6" 
                                color="text.secondary"
                                sx={{ 
                                    maxWidth: '700px',
                                    mx: 'auto',
                                    mb: 4,
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                }}
                            >
                                A comprehensive platform for seamless hackathon management and participation
                            </Typography>
                            
                            {/* Render the countdown timer */}
                            {renderCountdownTimer()}
                            
                            {/* Feature highlights */}
                            <Box sx={{ mt: 6 }}>
                                <Grid container spacing={3} justifyContent="center">
                                    {features.map((feature, index) => (
                                        <Grid item xs={12} sm={4} key={index}>
                                            <Box sx={{ 
                                                p: 2, 
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center'
                                            }}>
                                                <Avatar 
                                                    sx={{ 
                                                        width: 56, 
                                                        height: 56, 
                                                        mb: 2,
                                                        background: index % 2 === 0 ? 
                                                            'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 
                                                            'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                                    }}
                                                >
                                                    {feature.icon}
                                                </Avatar>
                                                <Typography variant="h6" gutterBottom>
                                                    {feature.title}
                                                </Typography>
                                                <Typography variant="body2" textAlign="center">
                                                    {feature.description}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Box>
                    </Container>
                </Box>

                {/* Portal Section - Always visible regardless of timer */}
                <Container maxWidth="lg" sx={{ py: 8 }}>
                    <Box sx={{ mb: 8 }}>
                        <Typography 
                            variant="h4" 
                            align="center" 
                            sx={{ mb: 1 }}
                        >
                            Choose Your Portal
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            align="center"
                            sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
                        >
                            Access the platform designed for your specific role in the hackathon
                        </Typography>
                        <Divider sx={{ mb: 6 }} />
                    </Box>
                    
                    {/* Portal Cards */}
                    <Grid container spacing={4} justifyContent="center">
                        {sections.map((section, idx) => (
                            <Grid item xs={12} sm={6} key={section.title}>
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Card accent top */}
                                    <Box 
                                        sx={{ 
                                            height: 8, 
                                            width: '100%', 
                                            backgroundColor: section.color
                                        }} 
                                    />
                                    
                                    {/* Card content */}
                                    <CardContent sx={{ 
                                        p: 4, 
                                        textAlign: 'center', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        height: '100%',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        {/* Background shape */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: -50,
                                            right: -50,
                                            width: 200,
                                            height: 200,
                                            borderRadius: '50%',
                                            background: `radial-gradient(circle, ${section.color}15 0%, ${section.color}00 70%)`,
                                            zIndex: 0
                                        }} />
                                        
                                        <Box>
                                            <Avatar 
                                                sx={{ 
                                                    width: 80, 
                                                    height: 80, 
                                                    mx: 'auto', 
                                                    mb: 3,
                                                    background: section.color === '#2563eb' ?
                                                        'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                                                        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                                }}
                                            >
                                                {section.icon}
                                            </Avatar>
                                            <Typography variant="h4" color="text.primary" gutterBottom>
                                                {section.title}
                                            </Typography>
                                            <Typography 
                                                variant="body1" 
                                                color="text.secondary" 
                                                sx={{ mb: 4, maxWidth: '400px', mx: 'auto' }}
                                            >
                                                {section.description}
                                            </Typography>
                                        </Box>
                                        
                                        <Stack spacing={2}>
                                            {section.buttons.map((btn) => (
                                                <Button
                                                    key={btn.label}
                                                    variant="contained"
                                                    color={btn.color}
                                                    size="large"
                                                    fullWidth
                                                    onClick={() => navigate(btn.path)}
                                                    sx={{ py: 1.5 }}
                                                >
                                                    {btn.label}
                                                </Button>
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                {/* Footer */}
                <Box 
                    component="footer" 
                    sx={{ 
                        mt: 8, 
                        py: 6, 
                        backgroundColor: 'white',
                        borderTop: '1px solid',
                        borderColor: 'rgba(226, 232, 240, 1)',
                    }}
                >
                    <Container maxWidth="lg">
                        <Box 
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Typography variant="h6" color="text.primary" sx={{ mb: { xs: 2, sm: 0 } }}>
                                Hackathon Platform
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                            © {new Date().getFullYear()} | Developed with ❤️ by OPQTech in Bengaluru
                            </Typography>
                        </Box>
                    </Container>
                </Box>
                
                {/* Notification for when hackathon starts */}
                <Snackbar 
                    open={showStartNotification} 
                    autoHideDuration={6000} 
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={handleCloseNotification} 
                        severity="success" 
                        sx={{ width: '100%' }}
                    >
                        The hackathon has started! You can now access all features.
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
};

export default HomePage;