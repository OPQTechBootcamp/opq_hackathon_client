import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoundStatus } from '../features/rounds/roundStatusSlice';
import {
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Grid,
    Box,
    styled,
    keyframes,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const ShimmerCard = styled(Card)`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite linear;
`;

const StatusIcon = styled(Box)(({ completion }) => ({
    borderRadius: '50%',
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    backgroundColor: completion === 100 ? 'green' : completion > 50 ? 'orange' : 'red',
}));

const RoundStatusDashboard = () => {
    const dispatch = useDispatch();
    const { rounds, loading, error } = useSelector((state) => state.roundStatus);

    useEffect(() => {
        dispatch(fetchRoundStatus());
    }, [dispatch]);

    if (loading) {
        return (
            <Grid container spacing={4} padding={4}>
                {[...Array(3)].map((_, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                        <ShimmerCard>
                            <CardContent className="space-y-2">
                                <Box sx={{ width: '80%', height: 24, bgcolor: 'grey.300', borderRadius: 1 }} />
                                <Box sx={{ width: '60%', height: 16, bgcolor: 'grey.300', borderRadius: 1 }} />
                                <Box sx={{ width: '70%', height: 16, bgcolor: 'grey.300', borderRadius: 1 }} />
                                <Box sx={{ height: 8, bgcolor: 'grey.300', borderRadius: 1 }} />
                                <Box sx={{ width: '40%', height: 16, bgcolor: 'grey.300', borderRadius: 1 }} />
                            </CardContent>
                        </ShimmerCard>
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (error) {
        return (
            <Box padding={4} display="flex" justifyContent="center" alignItems="center" height={200}>
                <Typography color="error" variant="h6">
                    Error loading round status: {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={4} padding={4}>
            {rounds.map((round) => (
                <Grid item xs={12} md={6} lg={4} key={round.round_id}>
                    <Card className="shadow-md" elevation={2}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="h6" fontWeight="semibold">
                                    Round {round.round_number}: {round.title}
                                </Typography>
                                <StatusIcon completion={round.evaluation_completion_percent}>
                                    {round.evaluation_completion_percent === 100 ? (
                                        <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                                    ) : round.evaluation_completion_percent > 50 ? (
                                        <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
                                    ) : (
                                        <Typography variant="caption" fontWeight="bold" fontSize={12}>
                                            !
                                        </Typography>
                                    )}
                                </StatusIcon>
                            </Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Submissions: <Typography component="span" fontWeight="bold" color="text.primary">{round.submission_count}</Typography>
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Evaluated: <Typography component="span" fontWeight="bold" color="text.primary">{round.evaluation_count}</Typography>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={round.evaluation_completion_percent}
                                    sx={{ height: 8, flexGrow: 1, borderRadius: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40, textAlign: 'right' }}>
                                    {round.evaluation_completion_percent}%
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                Evaluation Completion
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default RoundStatusDashboard;