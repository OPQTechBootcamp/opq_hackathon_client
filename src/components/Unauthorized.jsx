import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="80vh"
            flexDirection="column"
        >
            <Typography variant="h4" gutterBottom color="error">
                Unauthorized
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center" paragraph>
                You do not have permission to access this page.
            </Typography>
            <Button variant="outlined" onClick={handleGoBack}>
                Go Back
            </Button>
        </Box>
    );
};

export default Unauthorized;