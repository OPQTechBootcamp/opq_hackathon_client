import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const Loading = () => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        flexDirection="column"
    >
        <CircularProgress />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Loading...
        </Typography>
    </Box>
);

export default Loading;