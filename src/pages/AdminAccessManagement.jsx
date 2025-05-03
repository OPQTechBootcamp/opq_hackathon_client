import React, { useEffect, useState } from 'react';
import {
    Container, Paper, Typography, Box, Button,
    FormControl, InputLabel, Select, MenuItem,
    Autocomplete, TextField, CircularProgress,
    Stack, IconButton, List, ListItem, ListItemText, 
    Chip, Divider, Grid, Alert, useTheme, Tooltip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUsers, fetchTeams, fetchAssignments, assignJudges,
    unassignJudge
} from '../features/admin/adminSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import BadgeIcon from '@mui/icons-material/Badge';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    '& > svg': {
        marginRight: theme.spacing(1)
    }
}));

const AdminAccessManagement = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { users, teams, assignments, loading, error } = useSelector(state => state.admin);
    const { user } = useSelector(state => state.auth); // Current logged-in user

    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedJudges, setSelectedJudges] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchTeams());
        dispatch(fetchAssignments());
    }, [dispatch]);

    // Reset selected judges when team changes
    useEffect(() => {
        setSelectedJudges([]);
    }, [selectedTeam]);

    // Extract unique groups from teams
    const getGroups = () => {
        const groups = teams.map(team => team.section || 
                                 (team.section_team_id ? team.section_team_id.split('_')[0] : null))
                     .filter(Boolean);
        return [...new Set(groups)].sort();
    };

    const groups = getGroups();

    // Filter teams by selected group
    const filteredTeams = selectedGroup 
        ? teams.filter(team => {
            const teamGroup = team.section || (team.section_team_id ? team.section_team_id.split('_')[0] : null);
            return teamGroup === selectedGroup;
        })
        : teams;

    // Get currently assigned judge IDs for the selected team
    const getAssignedJudgeIds = (teamId) => {
        if (!teamId) return [];
        return assignments
            .filter(assign => assign.team_id === teamId)
            .map(assign => assign.judge_id);
    };

    // Get team code from team ID
    const getTeamCode = (teamId) => {
        if (!teamId) return '';
        const team = teams.find(t => t.id === teamId);
        return team ? (team.section_team_id || team.team_code || '') : '';
    };

    // Get assigned teams for each judge
    const getJudgeAssignments = (judgeId) => {
        if (!judgeId) return [];
        return assignments
            .filter(assign => assign.judge_id === judgeId)
            .map(assign => ({
                teamId: assign.team_id,
                teamCode: assign.section_team_id || '',
                teamName: assign.team_name
            }));
    };

    // Check if a judge is already assigned to teams with the same team code
    const isJudgeAssignedToSameTeamCode = (judgeId) => {
        if (!selectedTeam || !judgeId) return false;
        
        const currentTeamCode = getTeamCode(selectedTeam);
        if (!currentTeamCode) return false;
        
        const judgeAssignments = getJudgeAssignments(judgeId);
        
        return judgeAssignments.some(assignment => {
            const assignmentTeamCode = assignment.teamCode;
            // If team code includes underscore, compare the part before the underscore
            const assignmentCode = assignmentTeamCode.includes('_') 
                ? assignmentTeamCode.split('_')[0] 
                : assignmentTeamCode;
            
            const currentCode = currentTeamCode.includes('_') 
                ? currentTeamCode.split('_')[0] 
                : currentTeamCode;
                
            return assignmentCode === currentCode;
        });
    };

    const assignedJudgeIds = getAssignedJudgeIds(selectedTeam);

    const handleGroupChange = (event) => {
        setSelectedGroup(event.target.value);
        setSelectedTeam(''); // Reset team selection when group changes
    };

    const handleAssign = async () => {
        if (!selectedTeam || selectedJudges.length === 0) return;
        try {
            await dispatch(assignJudges({ 
                teamId: selectedTeam, 
                judgeIds: selectedJudges.map(j => j.id) 
            })).unwrap();
            
            dispatch(fetchAssignments());
            setSelectedJudges([]);
            setSuccessMessage('Judges assigned successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (assignError) {
            console.error("Error assigning judges:", assignError);
        }
    };

    const handleUnassign = async (assignmentId) => {
        try {
            await dispatch(unassignJudge({ assignmentId })).unwrap();
            dispatch(fetchAssignments());
            setSuccessMessage('Judge unassigned successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (unassignError) {
            console.error("Error unassigning judge:", unassignError);
        }
    };

    // Check if user is admin
    const isAdmin = user && user.role === 'admin';

    // Group assignments by team code and name
    const assignmentsByTeam = assignments.reduce((acc, assign) => {
        const key = `${assign.section_team_id || ''} - ${assign.team_name}`;
        if (!acc[key]) {
            acc[key] = {
                teamId: assign.team_id,
                teamName: assign.team_name,
                teamCode: assign.section_team_id,
                judges: []
            };
        }
        acc[key].judges.push({
            id: assign.id,
            judgeName: assign.judge_name,
            judgeId: assign.judge_id
        });
        return acc;
    }, {});

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <StyledTypography variant="h4" gutterBottom>
                <BadgeIcon fontSize="large" /> Access Management
            </StyledTypography>

            {loading && <CircularProgress sx={{ mt: 2, mb: 2 }} />}
            {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{successMessage}</Alert>}

            {/* Assign Judges Form */}
            <StyledPaper>
                <StyledTypography variant="h6" gutterBottom>
                    <PersonAddIcon /> Assign Judges to Teams
                </StyledTypography>
                <Stack spacing={3}>
                    {/* Group Selection */}
                    <FormControl fullWidth>
                        <InputLabel>Select Group</InputLabel>
                        <Select
                            value={selectedGroup}
                            label="Select Group"
                            onChange={handleGroupChange}
                        >
                            {groups.map(group => (
                                <MenuItem key={group} value={group}>Group {group}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Team Selection */}
                    <FormControl fullWidth disabled={!selectedGroup}>
                        <InputLabel>Select Team</InputLabel>
                        <Select
                            value={selectedTeam}
                            label="Select Team"
                            onChange={(e) => setSelectedTeam(e.target.value)}
                        >
                            {filteredTeams.map(team => (
                                <MenuItem key={team.id} value={team.id}>
                                    {team.section_team_id || team.team_code}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Judge Selection with Assigned Judges Disabled */}
                    <Autocomplete
                        multiple
                        options={users.filter(user => user.role === 'judge')}
                        getOptionLabel={(option) => option.name}
                        value={selectedJudges}
                        onChange={(e, value) => setSelectedJudges(value)}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Select Judges" 
                                placeholder="Search judges..."
                                helperText="Judges already assigned to this team or teams with the same team code are disabled"
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))
                        }
                        // Disable options if already assigned to this team or any team with the same team code
                        getOptionDisabled={(option) => 
                            assignedJudgeIds.includes(option.id) || 
                            isJudgeAssignedToSameTeamCode(option.id)
                        }
                        renderOption={(props, option, { selected }) => {
                            const isAssigned = assignedJudgeIds.includes(option.id);
                            const isAssignedToSameTeamCode = isJudgeAssignedToSameTeamCode(option.id);
                            
                            let tooltipText = '';
                            if (isAssigned) {
                                tooltipText = "Already assigned to this team";
                            } else if (isAssignedToSameTeamCode) {
                                tooltipText = "Already assigned to a team with the same team code";
                            }
                            
                            return (
                                <li {...props} style={{ 
                                    opacity: (isAssigned || isAssignedToSameTeamCode) ? 0.6 : 1,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>{option.name}</span>
                                    {(isAssigned || isAssignedToSameTeamCode) && (
                                        <Tooltip title={tooltipText}>
                                            <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
                                        </Tooltip>
                                    )}
                                </li>
                            );
                        }}
                        disabled={!selectedTeam}
                        disableCloseOnSelect
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAssign}
                        disabled={!selectedTeam || selectedJudges.length === 0 || loading}
                        startIcon={<PersonAddIcon />}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Assign Judges'}
                    </Button>
                </Stack>
            </StyledPaper>

            {/* Current Assignments List */}
            <StyledPaper>
                <StyledTypography variant="h6" gutterBottom>
                    <FormatListNumberedIcon /> Current Assignments
                </StyledTypography>
                
                {Object.keys(assignmentsByTeam).length > 0 ? (
                    <List sx={{ width: '100%' }}>
                        {Object.entries(assignmentsByTeam).map(([teamKey, teamData], index) => (
                            <React.Fragment key={teamKey}>
                                <Box sx={{ mb: 2, mt: index > 0 ? 3 : 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <GroupIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {teamData.teamCode ? (
                                                <>
                                                    <Chip 
                                                        label={teamData.teamCode} 
                                                        color="primary" 
                                                        size="small" 
                                                        sx={{ mr: 1, fontWeight: 'bold' }} 
                                                    />
                                                    {teamData.teamName}
                                                </>
                                            ) : (
                                                teamData.teamName
                                            )}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ pl: 4, mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Assigned Judges:
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {teamData.judges.map((judge) => (
                                                <Grid item xs={12} key={judge.id}>
                                                    <Box 
                                                        sx={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            p: 1,
                                                            borderRadius: 1,
                                                            border: `1px solid ${theme.palette.divider}`,
                                                            '&:hover': {
                                                                bgcolor: theme.palette.action.hover
                                                            }
                                                        }}
                                                    >
                                                        <Typography variant="body2">
                                                            {judge.judgeName}
                                                        </Typography>
                                                        
                                                        {isAdmin && (
                                                            <IconButton
                                                                edge="end"
                                                                aria-label="delete"
                                                                onClick={() => handleUnassign(judge.id)}
                                                                color="error"
                                                                size="small"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </Box>
                                {index < Object.entries(assignmentsByTeam).length - 1 && (
                                    <Divider />
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography color="text.secondary">
                        No judges are currently assigned to teams.
                    </Typography>
                )}
            </StyledPaper>
        </Container>
    );
};

export default AdminAccessManagement;