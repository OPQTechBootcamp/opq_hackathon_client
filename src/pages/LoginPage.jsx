import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import {
    Container, TextField, Button, Typography, Box, Alert, CircularProgress
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Professional blue
        },
        secondary: {
            main: '#dc004e', // Accent color
        },
        background: {
            default: '#f0f2f5',
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

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, user, status, message } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await dispatch(login(formData));
    };

    useEffect(() => {
        if (status === 'success' && message === 'Login successful') {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                navigate(`/${user?.role}/dashboard`);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, message, navigate, user]);

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
                        Login
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {showSuccess && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                        <TextField
                            label="Email Address"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || showSuccess}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default LoginPage;