import React, { useState } from 'react';
import {
    Container, Box, Typography, TextField, Button, Alert, Link, Grid
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginTeam } from '../features/team/teamSlice';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2979ff', // A professional blue
        },
        secondary: {
            main: '#f50057', // A vibrant pink for accent
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

const TeamLoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({ team_email: '', password: '' });
    const [error, setError] = useState(null);
    const loading = useSelector((state) => state.team.loading); // Assuming loading state in teamSlice

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const result = await dispatch(loginTeam(form));

            if (result.meta.requestStatus === 'fulfilled') {
                navigate('/teamDashboard');
            } else {
                setError(result.payload || 'Login failed');
            }
        } catch (err) {
            setError('Login failed');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography component="h1" variant="h5">
                        Team Login
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        <TextField
                            label="Email Address"
                            name="team_email"
                            type="team_email"
                            required
                            value={form.team_email}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            required
                            value={form.password}
                            onChange={handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Logging In...' : 'Login'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/team/register" variant="body2">
                                    {"Don't have an account? Register"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default TeamLoginPage;