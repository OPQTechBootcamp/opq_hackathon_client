import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTeamsRatings } from '../features/judgeDashboard/judgeDashboardSlice';
import {
    Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, 
    CircularProgress, Box, Typography, Tabs, Tab, Chip, Rating,
    useTheme, TableSortLabel, TablePagination, styled, Dialog, DialogTitle, 
    DialogContent, IconButton, Button, List, ListItem, ListItemText, Divider,
    DialogActions, Grid, Card, CardContent, DialogContentText, Tooltip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import apiInstance from '../utils/apiInstance';
import { getToken } from '../utils/tokenUtils';
// Styled table cells for consistent formatting and better horizontal scrolling
const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    padding: '16px 12px'
}));

const StyledTableCell = styled(TableCell)({
    whiteSpace: 'nowrap',
    padding: '12px'
});

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const AllTeamsRatingsTable = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { allTeamsRatings, loading } = useSelector((state) => state.judgeDashboard);
    
    const [activeGroup, setActiveGroup] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('average_rating');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamResults, setTeamResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [resultError, setResultError] = useState(null);

    // Extract unique team groups
    const getTeamGroups = () => {
        if (!allTeamsRatings || allTeamsRatings.length === 0) return ['all'];
        const groups = allTeamsRatings.map(team => 
            team.team_code?.split('_')[0] || team.team_group || 'Unknown'
        );
        return ['all', ...new Set(groups)].filter(Boolean);
    };
    
    const teamGroups = getTeamGroups();

    useEffect(() => {
        dispatch(fetchAllTeamsRatings());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleGroupChange = (event, newGroup) => {
        setActiveGroup(newGroup);
        setPage(0);
    };
    
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleViewDetails = async (team) => {
        setSelectedTeam(team);
        setLoadingResults(true);
        setResultError(null);
        
        try {
            // Fetch team evaluation details
            const response = await apiInstance.get(`results/${team.team_id}`, authHeader());
            setTeamResults(response.data);
            setDialogOpen(true);
        } catch (error) {
            console.error('Error fetching team results:', error);
            setResultError('Failed to load team evaluation details');
        } finally {
            setLoadingResults(false);
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedTeam(null);
        setTeamResults([]);
    };

    const createSortHandler = (property) => () => {
        handleRequestSort(property);
    };

    // Filter and sort teams
    const getFilteredAndSortedTeams = () => {
        if (!allTeamsRatings) return [];
        
        let filteredTeams = [...allTeamsRatings];
        
        // Filter by group
        if (activeGroup !== 'all') {
            filteredTeams = filteredTeams.filter(team => {
                const teamGroup = team.team_code?.split('_')[0] || team.team_group;
                return teamGroup === activeGroup;
            });
        }
        
        // Sort teams
        return filteredTeams.sort((a, b) => {
            const aValue = a[orderBy] || 0;
            const bValue = b[orderBy] || 0;
            
            // Return sorting order
            return (order === 'asc' ? 1 : -1) * (aValue < bValue ? -1 : aValue > bValue ? 1 : 0);
        });
    };
    
    const filteredAndSortedTeams = getFilteredAndSortedTeams();
    
    // Group team results by round
    const groupedResults = teamResults.reduce((acc, result) => {
        const roundKey = `Round ${result.round_number}: ${result.title}`;
        
        if (!acc[roundKey]) {
            acc[roundKey] = {
                roundNumber: result.round_number,
                title: result.title,
                description: result.description,
                evaluations: []
            };
        }
        
        acc[roundKey].evaluations.push(result);
        return acc;
    }, {});
    
    // Get teams for current page
    const currentPageTeams = filteredAndSortedTeams.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    // No data state
    if (!allTeamsRatings || allTeamsRatings.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No team ratings available.</Typography>
            </Paper>
        );
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Group Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                    value={activeGroup}
                    onChange={handleGroupChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 1 }}
                >
                    {teamGroups.map((group) => (
                        <Tab 
                            key={group} 
                            label={group === 'all' ? 'All Groups' : `Series ${group}`} 
                            value={group}
                            sx={{ 
                                fontWeight: 'bold',
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main,
                                }
                            }}
                        />
                    ))}
                </Tabs>
            </Box>

            <TableContainer 
                component={Paper} 
                elevation={2} 
                sx={{ 
                    mb: 2, 
                    borderRadius: 2, 
                    maxWidth: '100%',
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.grey[300],
                        borderRadius: '4px',
                    }
                }}
            >
                <Table size="medium" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledHeaderCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white'
                                }}
                            >
                                Team Code
                            </StyledHeaderCell>
                            <StyledHeaderCell 
                                sortDirection={orderBy === 'team_name' ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === 'team_name'}
                                    direction={orderBy === 'team_name' ? order : 'asc'}
                                    onClick={createSortHandler('team_name')}
                                >
                                    Team Name
                                </TableSortLabel>
                            </StyledHeaderCell>
                            <StyledHeaderCell>
                                Problem Statement
                            </StyledHeaderCell>
                            <StyledHeaderCell 
                                align="center" 
                                sortDirection={orderBy === 'average_rating' ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === 'average_rating'}
                                    direction={orderBy === 'average_rating' ? order : 'desc'}
                                    onClick={createSortHandler('average_rating')}
                                >
                                    Rating
                                </TableSortLabel>
                            </StyledHeaderCell>
                            <StyledHeaderCell align="center">
                                Rounds Evaluated
                            </StyledHeaderCell>
                            <StyledHeaderCell>
                                Judges
                            </StyledHeaderCell>
                            <StyledHeaderCell align="center">
                                Actions
                            </StyledHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentPageTeams.map((team) => {
                            // Extract team group from code
                            const teamGroup = team.team_code?.split('_')[0] || team.team_group;
                            // Parse rating
                            const rating = parseFloat(team.average_rating) || 0;
                            // Format rounds
                            const rounds = team.rounds ? team.rounds.split(',').map(r => r.trim()) : [];
                            // Format judges
                            const judges = team.judge_names ? team.judge_names.split(',').map(j => j.trim()) : [];

                            return (
                                <TableRow 
                                    key={team.team_id}
                                    hover
                                    sx={{ 
                                        '&:nth-of-type(odd)': { 
                                            backgroundColor: theme.palette.action.hover 
                                        },
                                        cursor: 'pointer'
                                    }}
                                >
                                    <StyledTableCell>
                                        <Chip
                                            label={team.team_code}
                                            color="primary"
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {team.team_name}
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {team.problem_statement_title}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                gap: 1 
                                            }}
                                        >
                                            <Rating
                                                value={rating / 2} // Convert to 5-star scale
                                                precision={0.5}
                                                readOnly
                                                size="small"
                                                icon={<StarIcon fontSize="inherit" />}
                                                emptyIcon={<StarBorderIcon fontSize="inherit" />}
                                            />
                                            <Typography 
                                                variant="body2" 
                                                fontWeight="bold"
                                                sx={{ 
                                                    color: getRatingColor(rating),
                                                    ml: 1
                                                }}
                                            >
                                                {rating.toFixed(1)}
                                            </Typography>
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                            {rounds.length > 0 ? (
                                                rounds.map((round, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={`R${round}`}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        sx={{ margin: '2px' }}
                                                    />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    None
                                                </Typography>
                                            )}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {judges.length > 0 ? (
                                                judges.map((judge, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={judge}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ margin: '2px' }}
                                                    />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Not Assigned
                                                </Typography>
                                            )}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Tooltip title="View Details">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewDetails(team)}
                                            >
                                                Details
                                            </Button>
                                        </Tooltip>
                                    </StyledTableCell>
                                </TableRow>
                            );
                        })}
                        {filteredAndSortedTeams.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1">No teams available in this group.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredAndSortedTeams.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Team Results Detail Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ 
                    backgroundColor: theme.palette.primary.main, 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box>
                        <Typography variant="h6">
                            Team Evaluation Details
                        </Typography>
                        {selectedTeam && (
                            <Typography variant="subtitle1">
                                {selectedTeam.team_code} - {selectedTeam.team_name}
                            </Typography>
                        )}
                    </Box>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleCloseDialog}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {loadingResults ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : resultError ? (
                        <Alert severity="error">{resultError}</Alert>
                    ) : teamResults.length === 0 ? (
                        <DialogContentText>
                            No evaluation details available for this team.
                        </DialogContentText>
                    ) : (
                        <Box>
                            {/* Display results grouped by round */}
                            {Object.entries(groupedResults).map(([roundKey, roundData], index) => (
                                <Box key={roundKey} sx={{ mb: 4 }}>
                                    <Typography 
                                        variant="h6" 
                                        color="primary" 
                                        gutterBottom
                                        sx={{
                                            pb: 1,
                                            borderBottom: `1px solid ${theme.palette.divider}`
                                        }}
                                    >
                                        {roundKey}
                                    </Typography>
                                    
                                    {roundData.description && (
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            {roundData.description}
                                        </Typography>
                                    )}
                                    
                                    <Grid container spacing={2}>
                                        {roundData.evaluations.map((evaluation, evalIndex) => (
                                            <Grid item xs={12} md={6} key={evalIndex}>
                                                <Card 
                                                    elevation={2}
                                                    sx={{ 
                                                        height: '100%',
                                                        border: `1px solid ${theme.palette.divider}`
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Typography 
                                                            variant="subtitle1" 
                                                            fontWeight="bold"
                                                            gutterBottom
                                                        >
                                                            Judge: {evaluation.judge_name}
                                                        </Typography>
                                                        
                                                        <Typography 
                                                            variant="caption" 
                                                            color="text.secondary"
                                                            display="block"
                                                            gutterBottom
                                                        >
                                                            Evaluated on: {formatDate(evaluation.created_at)}
                                                        </Typography>
                                                        
                                                        <Grid container spacing={1} sx={{ mt: 1 }}>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2">
                                                                    Innovation: <strong>{evaluation.innovation}</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2">
                                                                    Technical: <strong>{evaluation.technical}</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2">
                                                                    Relevance: <strong>{evaluation.relevance}</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2">
                                                                    Feasibility: <strong>{evaluation.feasibility}</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2">
                                                                    Design: <strong>{evaluation.design}</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2">
                                                                    Collaboration: <strong>{evaluation.collaboration}</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2">
                                                                    Presentation: <strong>{evaluation.presentation}</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2">
                                                                    Bonus: <strong>{evaluation.bonus}</strong>
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        
                                                        <Box 
                                                            sx={{ 
                                                                mt: 2, 
                                                                p: 1, 
                                                                bgcolor: theme.palette.primary.main + '22',
                                                                borderRadius: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between'
                                                            }}
                                                        >
                                                            <Typography fontWeight="bold">
                                                                Total Score:
                                                            </Typography>
                                                            <Typography 
                                                                fontWeight="bold" 
                                                                variant="h6"
                                                                sx={{ 
                                                                    color: getRatingColor(evaluation.total_score)
                                                                }}
                                                            >
                                                                {evaluation.total_score} / 75
                                                            </Typography>
                                                        </Box>
                                                        
                                                        {evaluation.comment && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography variant="subtitle2">
                                                                    Comments:
                                                                </Typography>
                                                                <Typography 
                                                                    variant="body2" 
                                                                    sx={{ 
                                                                        mt: 0.5,
                                                                        p: 1,
                                                                        bgcolor: theme.palette.background.default,
                                                                        borderRadius: 1
                                                                    }}
                                                                >
                                                                    {evaluation.comment}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// Helper function to get color based on rating
const getRatingColor = (rating) => {
    if (rating >= 8) return '#2e7d32'; // success.dark
    if (rating >= 6) return '#1976d2'; // primary.main
    if (rating >= 4) return '#ed6c02'; // warning.main
    return '#d32f2f'; // error.main
};

export default AllTeamsRatingsTable;