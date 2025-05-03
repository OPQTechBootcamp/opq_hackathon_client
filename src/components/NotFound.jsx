import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="80vh"
            flexDirection="column"
        >
            <Typography variant="h4" gutterBottom>
                404 - Page Not Found
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center" paragraph>
                The page you are looking for does not exist. Please check the URL or go back to the homepage.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGoHome}>
                Go to Homepage
            </Button>
        </Box>
    );
};

export default NotFound;