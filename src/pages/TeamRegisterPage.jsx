import React, { useState } from 'react';
import {
    Container, Box, Typography, TextField, Button, Alert, IconButton, Grid, Link,
    FormHelperText, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { registerTeam } from '../features/team/teamSlice';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const theme = createTheme({
    palette: {
        primary: {
            main: '#388e3c', // A professional green
        },
        secondary: {
            main: '#f57c00', // An orange accent
        },
        background: {
            default: '#f4f6f8', // Light grey background
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
        MuiIconButton: {
            styleOverrides: {
                root: {
                    marginLeft: '0.5rem',
                },
            },
        },
    },
});

const TeamRegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        team_name: '',
        team_email: '',
        alternate_email: '',
        phone_number: '',
        alternate_phone: '',
        password: '',
        confirmPassword: '', // Added confirm password field
        team_members: [''],
        section: '', 
        section_number: '' 
    });
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({
        password: '',
        confirmPassword: ''
    });
    const loading = useSelector((state) => state.team.loading); 
    const sectionOptions = Array.from({ length: 8 }, (_, i) => String.fromCharCode(65 + i));
    const sectionNumberOptions = Array.from({ length: 30 }, (_, i) => i + 1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        
        // Validate password
        if (name === 'password') {
            if (value.length < 6) {
                setValidationErrors(prev => ({
                    ...prev,
                    password: 'Password must be at least 6 characters long'
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    password: ''
                }));
            }
            
            // Check if passwords match when password is changed
            if (form.confirmPassword && value !== form.confirmPassword) {
                setValidationErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Passwords do not match'
                }));
            } else if (form.confirmPassword) {
                setValidationErrors(prev => ({
                    ...prev,
                    confirmPassword: ''
                }));
            }
        }
        
        // Validate confirm password
        if (name === 'confirmPassword') {
            if (value !== form.password) {
                setValidationErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Passwords do not match'
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    confirmPassword: ''
                }));
            }
        }
    };

    const handleMemberChange = (index, value) => {
        const updatedMembers = [...form.team_members];
        updatedMembers[index] = value;
        setForm({ ...form, team_members: updatedMembers });
    };

    const addMember = () => {
        setForm({ ...form, team_members: [...form.team_members, ''] });
    };

    const removeMember = (index) => {
        const updatedMembers = form.team_members.filter((_, i) => i !== index);
        setForm({ ...form, team_members: updatedMembers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const membersObject = form.team_members.reduce((acc, name, i) => {
            acc[`member${i + 1}`] = name;
            return acc;
        }, {});

        // Format section_team_id as "SECTION_NUMBER" (e.g., "A_1")
        const section_team_id = form.section && form.section_number ? 
            `${form.section}_${form.section_number}` : '';

        try {
            const result = await dispatch(registerTeam({
                team_name: form.team_name,
                team_email: form.team_email,
                alternate_email: form.alternate_email,
                phone_number: form.phone_number,
                alternate_phone: form.alternate_phone,
                password: form.password,
                team_members: membersObject,
                section: form.section, // Send section
                section_team_id: section_team_id // Send formatted section_team_id
            }));

            if (result.meta.requestStatus === 'fulfilled') {
                setSuccess('Team registered successfully!');
                setForm({
                    team_name: '',
                    team_email: '',
                    alternate_email: '',
                    phone_number: '',
                    alternate_phone: '',
                    password: '',
                    confirmPassword: '', // Reset confirm password
                    team_members: [''],
                    section: '',
                    section_number: ''
                });
                setTimeout(() => navigate('/team/login'), 2000); // Redirect after successful registration
            } else {
                setError(result.payload || 'Failed to register team');
            }
        } catch (err) {
            setError('Registration failed');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="sm">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <GroupAddIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography component="h1" variant="h5">
                        Team Registration
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <TextField label="Team Name" name="team_name" required value={form.team_name} onChange={handleChange} />
                        
                        <TextField 
                            label="Team Email Address" 
                            name="team_email" 
                            type="email" 
                            required 
                            value={form.team_email} 
                            onChange={handleChange} 
                        />
                        <FormHelperText sx={{ mt: -1, mb: 1 }}>
                            Please use a team email address, not personal email
                        </FormHelperText>
                        
                        <TextField 
                            label="Alternate Email Address" 
                            name="alternate_email" 
                            type="email" 
                            value={form.alternate_email} 
                            onChange={handleChange} 
                        />
                        
                        <TextField 
                            label="Phone Number" 
                            name="phone_number" 
                            value={form.phone_number} 
                            onChange={handleChange} 
                            required
                        />
                        
                        <TextField 
                            label="Alternate Phone Number" 
                            name="alternate_phone" 
                            value={form.alternate_phone} 
                            onChange={handleChange} 
                        />
                        
                        <TextField 
                            label="Password" 
                            name="password" 
                            type="password" 
                            required 
                            value={form.password} 
                            onChange={handleChange}
                            error={!!validationErrors.password}
                            helperText={validationErrors.password || 'Password must be at least 6 characters'}
                        />
                        
                        {/* Confirm Password Field */}
                        <TextField 
                            label="Confirm Password" 
                            name="confirmPassword" 
                            type="password" 
                            required 
                            value={form.confirmPassword} 
                            onChange={handleChange}
                            error={!!validationErrors.confirmPassword}
                            helperText={validationErrors.confirmPassword}
                        />

                        {/* Section Dropdown */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="section-label">Series</InputLabel>
                            <Select
                                labelId="section-label"
                                id="section"
                                name="section"
                                value={form.section}
                                label="Series"
                                onChange={handleChange}
                                required
                            >
                                {sectionOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Section Number Dropdown */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="section-number-label">Series ID</InputLabel>
                            <Select
                                labelId="section-number-label"
                                id="section_number"
                                name="section_number"
                                value={form.section_number}
                                label="Team Code ID"
                                onChange={handleChange}
                                required
                            >
                                {sectionNumberOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        {/* Warning Note */}
                        <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                            Make sure you select the correct Series and ID. You won't be able to change this in the future.
                        </Alert>

                        <Typography variant="subtitle1">Team Members</Typography>
                        {form.team_members.map((member, index) => (
                            <Box key={index} display="flex" alignItems="center" mt={1}>
                                <TextField
                                    label={`Member ${index + 1} Name`}
                                    fullWidth
                                    value={member}
                                    onChange={(e) => handleMemberChange(index, e.target.value)}
                                />
                                {form.team_members.length > 1 && (
                                    <IconButton onClick={() => removeMember(index)} color="secondary">
                                        <RemoveIcon />
                                    </IconButton>
                                )}
                            </Box>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={addMember}
                            sx={{ mt: 2, mb: 1 }}
                        >
                            Add Member
                        </Button>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || !!validationErrors.password || !!validationErrors.confirmPassword}
                        >
                            {loading ? 'Registering...' : 'Register Team'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/team/login" variant="body2">
                                    {"Already have an account? Login"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default TeamRegisterPage;