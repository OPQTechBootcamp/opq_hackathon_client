import React, { useEffect, useState } from 'react';
import apiInstance from "../utils/apiInstance"
import {
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Grid,
    Box,
    CircularProgress,
    styled,
    AppBar,
    Toolbar,
} from '@mui/material';
import { getToken } from "../utils/tokenUtils";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});
const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [judges, setJudges] = useState([]);
    const [filters, setFilters] = useState({ round_id: '', judge_id: '', top: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [filters]);

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [leaderboardRes, roundsRes, judgesRes] = await Promise.all([
                apiInstance.get('/leaderboard'),
                apiInstance.get('/rounds', authHeader()),
                apiInstance.get('/users?role=judge'),
            ]);
            setLeaderboard(leaderboardRes.data);
            setRounds(roundsRes.data);
            setJudges(judgesRes.data);
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError(null);
    
        try {
            const res = await apiInstance.post('/results/leaderboard', filters, authHeader());
            setLeaderboard(res.data);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError('Failed to load leaderboard.');
        } finally {
            setLoading(false);
        }
    };
    

    const handleFilterChange = (name, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, spaceY: 2 }}>
            <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
                <Toolbar>
                    <Typography variant="h6" color="inherit">
                        Leaderboard
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel id="round-select-label">Select Round</InputLabel>
                    <Select
                        labelId="round-select-label"
                        id="round-select"
                        value={filters.round_id}
                        label="Select Round"
                        onChange={(e) => handleFilterChange('round_id', e.target.value)}
                    >
                        <MenuItem value="">
                            <em>All Rounds</em>
                        </MenuItem>
                        {rounds.map((r) => (
                            <MenuItem key={r.id} value={String(r.id)}>
                                Round {r.round_number}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel id="judge-select-label">Select Judge</InputLabel>
                    <Select
                        labelId="judge-select-label"
                        id="judge-select"
                        value={filters.judge_id}
                        label="Select Judge"
                        onChange={(e) => handleFilterChange('judge_id', e.target.value)}
                    >
                        <MenuItem value="">
                            <em>All Judges</em>
                        </MenuItem>
                        {judges.map((j) => (
                            <MenuItem key={j.id} value={String(j.id)}>
                                {j.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Top N"
                    type="number"
                    value={filters.top}
                    onChange={(e) => handleFilterChange('top', e.target.value)}
                    sx={{ width: 120 }}
                />
            </Box>

            <Grid container spacing={3}>
                {leaderboard.map((team, index) => (
                    <Grid item xs={12} sm={6} md={4} key={team.team_id}>
                        <Card sx={{ boxShadow: 3 }}>
                            <CardContent sx={{ p: 3, spaceY: 1 }}>
                                <Typography variant="h6" component="div" fontWeight="bold">
                                    #{index + 1} {team.team_name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Email: {team.team_email}
                                </Typography>
                                <Typography variant="body2">
                                    Avg Rating: {team.average_rating ?? 'NA'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Rounds Evaluated: {team.rounds_evaluated}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Leaderboard;