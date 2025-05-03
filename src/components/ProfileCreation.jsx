import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, TextField, Button, Alert, Grid,
    FormHelperText
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import { useSelector } from "react-redux";
import { getTeamToken } from '../utils/tokenUtils';
import apiInstance from '../utils/apiInstance';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getTeamToken()}` }
});

const theme = createTheme({
    palette: {
        primary: {
            main: '#388e3c',
        },
        secondary: {
            main: '#f57c00',
        },
        background: {
            default: '#f4f6f8',
        },
    },
    typography: {
        h5: {
            fontWeight: 600,
            marginBottom: '1rem',
            textAlign: 'center',
        },
        subtitle1: {
            fontWeight: 500,
            marginTop: '1.5rem',
            marginBottom: '0.5rem',
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    padding: '2rem',
                    borderRadius: 8,
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                margin: 'normal',
                fullWidth: true,
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    borderRadius: 6,
                },
            },
        },
    },
});

const TeamMemberProfileForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const teamData = useSelector((state) => state.team.team);
    const teamId = teamData?.id;
    
    // Redirect if no team ID is found
    useEffect(() => {
        if (!teamId) {
            navigate('/team/login');
        }
    }, [teamId, navigate]);

    const [form, setForm] = useState({
        member_name: '',
        full_name: '',
        email: '',
        phone_number: '',
        linkedin_url: '',
        branch: '',
        college: '',
        interests: '',
        bio: ''
    });
    
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiInstance.post('team/member-profile', {
                team_id: teamId,
                ...form
            }, authHeader());

            if (response.status === 201) {
                setSuccess('Member profile created successfully!');
            } else {
                setError(response.data.message || 'Failed to create member profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Profile creation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="md">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 8
                    }}
                >
                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography component="h1" variant="h5">
                        Team Member Profile
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
                        Create profiles for each member of your team
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="Member Name (as registered in team)" 
                                    name="member_name" 
                                    required 
                                    value={form.member_name} 
                                    onChange={handleChange}
                                    placeholder="Enter the exact name used during team registration"
                                />
                                <FormHelperText>This must match exactly with the name used during team registration</FormHelperText>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="Full Name" 
                                    name="full_name" 
                                    required 
                                    value={form.full_name} 
                                    onChange={handleChange} 
                                    InputProps={{
                                        startAdornment: <PersonIcon color="primary" sx={{ mr: 1 }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="Email" 
                                    name="email" 
                                    type="email" 
                                    required 
                                    value={form.email} 
                                    onChange={handleChange} 
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="Phone Number" 
                                    name="phone_number" 
                                    required 
                                    value={form.phone_number} 
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: <PhoneIcon color="primary" sx={{ mr: 1 }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="LinkedIn URL" 
                                    name="linkedin_url" 
                                    value={form.linkedin_url} 
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: <LinkedInIcon color="primary" sx={{ mr: 1 }} />
                                    }}
                                />
                                <FormHelperText>Optional</FormHelperText>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="Branch" 
                                    name="branch" 
                                    required 
                                    value={form.branch} 
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="College/University" 
                                    name="college" 
                                    required
                                    value={form.college} 
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: <SchoolIcon color="primary" sx={{ mr: 1 }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    label="Technical Interests" 
                                    name="interests" 
                                    required
                                    value={form.interests} 
                                    onChange={handleChange}
                                    placeholder="Enter technical interests (e.g., JavaScript, Python, Machine Learning)"
                                    helperText="Separate multiple interests with commas"
                                    InputProps={{
                                        startAdornment: <CodeIcon color="primary" sx={{ mr: 1 }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Short Bio"
                                    name="bio"
                                    multiline
                                    rows={4}
                                    value={form.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself, your experience, and your goals"
                                />
                                <FormHelperText>Optional - Brief introduction about the team member</FormHelperText>
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 4, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Creating Profile...' : 'Create Member Profile'}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default TeamMemberProfileForm;