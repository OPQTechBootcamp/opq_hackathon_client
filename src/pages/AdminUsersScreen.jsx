// pages/admin/AdminUsersScreen.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsersAndTeams } from '../features/admin/adminUsersSlice';
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    styled,
    Box,
    Toolbar,
    AppBar,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    InputBase,
    alpha,
    Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import JudgeIcon from '@mui/icons-material/Gavel';
import CoordinatorIcon from '@mui/icons-material/SupervisorAccount';
import AllUsersIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
    padding: theme.spacing(1.5),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const StyledCard = styled(Card)(({ theme }) => ({
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const AdminUsersScreen = () => {
    const dispatch = useDispatch();
    const { users, teams, loading, error } = useSelector((state) => state.adminUsers);
    const [userTabValue, setUserTabValue] = useState(0);
    const [teamTabValue, setTeamTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchAllUsersAndTeams());
    }, [dispatch]);

    const handleUserTabChange = (event, newValue) => {
        setUserTabValue(newValue);
    };

    const handleTeamTabChange = (event, newValue) => {
        setTeamTabValue(newValue);
    };

    const handleRefresh = () => {
        dispatch(fetchAllUsersAndTeams());
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    // Filter users based on role and search query
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            searchQuery === '' || 
            user.name.toLowerCase().includes(searchQuery) || 
            user.email.toLowerCase().includes(searchQuery);
        
        if (userTabValue === 0) return matchesSearch; // All
        if (userTabValue === 1) return user.role === 'admin' && matchesSearch;
        if (userTabValue === 2) return user.role === 'judge' && matchesSearch;
        if (userTabValue === 3) return user.role === 'coordinator' && matchesSearch;
        
        return false;
    });

    // Extract unique sections/groups from teams
    const sections = ['All Groups', ...new Set(teams.map(team => 
        team.section ? `Section ${team.section}` : ''
    ).filter(Boolean))].sort();

    // Filter teams based on section and search query
    const filteredTeams = teams.filter(team => {
        const matchesSearch = 
            searchQuery === '' || 
            team.team_name.toLowerCase().includes(searchQuery) || 
            (team.section_team_id && team.section_team_id.toLowerCase().includes(searchQuery));
        
        if (teamTabValue === 0) return matchesSearch; // All Groups
        
        const sectionName = `Section ${team.section}`;
        return sections[teamTabValue] === sectionName && matchesSearch;
    });

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
        </Box>
    );

    if (error) return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <AppBar position="static" color="default" elevation={1} sx={{ mb: 3, borderRadius: 1 }}>
                <Toolbar>
                    <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
                        Users & Teams Management
                    </Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={handleSearchChange}
                        />
                    </Search>
                    <Tooltip title="Refresh Data">
                        <IconButton onClick={handleRefresh} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* Users Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={userTabValue} 
                        onChange={handleUserTabChange} 
                        indicatorColor="primary"
                        textColor="primary"
                        aria-label="user role tabs"
                    >
                        <Tab icon={<AllUsersIcon fontSize="small" />} iconPosition="start" label="All Users" />
                        <Tab icon={<AdminIcon fontSize="small" />} iconPosition="start" label="Admins" />
                        <Tab icon={<JudgeIcon fontSize="small" />} iconPosition="start" label="Judges" />
                        <Tab icon={<CoordinatorIcon fontSize="small" />} iconPosition="start" label="Coordinators" />
                    </Tabs>
                </Box>
                
                <TabPanel value={userTabValue} index={0}>
                    <StyledCard>
                        <CardContent sx={{ p: 0 }}>
                            <TableContainer>
                                <Table aria-label="users table" size="small">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>ID</StyledTableCell>
                                            <StyledTableCell>Name</StyledTableCell>
                                            <StyledTableCell>Email</StyledTableCell>
                                            <StyledTableCell>Role</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <StyledTableRow key={user.id}>
                                                <TableCell>{user.id}</TableCell>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell sx={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                                            </StyledTableRow>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </StyledCard>
                </TabPanel>

                <TabPanel value={userTabValue} index={1}>
                    <StyledCard>
                        <CardContent sx={{ p: 0 }}>
                            <TableContainer>
                                <Table aria-label="admins table" size="small">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>ID</StyledTableCell>
                                            <StyledTableCell>Name</StyledTableCell>
                                            <StyledTableCell>Email</StyledTableCell>
                                            <StyledTableCell>Role</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <StyledTableRow key={user.id}>
                                                <TableCell>{user.id}</TableCell>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell sx={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                                            </StyledTableRow>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                    No admins found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </StyledCard>
                </TabPanel>

                <TabPanel value={userTabValue} index={2}>
                    <StyledCard>
                        <CardContent sx={{ p: 0 }}>
                            <TableContainer>
                                <Table aria-label="judges table" size="small">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>ID</StyledTableCell>
                                            <StyledTableCell>Name</StyledTableCell>
                                            <StyledTableCell>Email</StyledTableCell>
                                            <StyledTableCell>Role</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <StyledTableRow key={user.id}>
                                                <TableCell>{user.id}</TableCell>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell sx={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                                            </StyledTableRow>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                    No judges found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </StyledCard>
                </TabPanel>

                <TabPanel value={userTabValue} index={3}>
                    <StyledCard>
                        <CardContent sx={{ p: 0 }}>
                            <TableContainer>
                                <Table aria-label="coordinators table" size="small">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>ID</StyledTableCell>
                                            <StyledTableCell>Name</StyledTableCell>
                                            <StyledTableCell>Email</StyledTableCell>
                                            <StyledTableCell>Role</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <StyledTableRow key={user.id}>
                                                <TableCell>{user.id}</TableCell>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell sx={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                                            </StyledTableRow>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                    No coordinators found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </StyledCard>
                </TabPanel>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Teams Section */}
            <Box sx={{ mt: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={teamTabValue} 
                        onChange={handleTeamTabChange} 
                        indicatorColor="primary"
                        textColor="primary"
                        aria-label="team section tabs"
                        scrollButtons="auto"
                        variant="scrollable"
                    >
                        {sections.map((section, index) => (
                            <Tab 
                                key={index} 
                                icon={<GroupsIcon fontSize="small" />} 
                                iconPosition="start" 
                                label={section} 
                            />
                        ))}
                    </Tabs>
                </Box>
                
                {sections.map((section, index) => (
                    <TabPanel key={index} value={teamTabValue} index={index}>
                        <StyledCard>
                            <CardContent sx={{ p: 0 }}>
                                <TableContainer>
                                    <Table aria-label="teams table" size="small">
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>ID</StyledTableCell>
                                                <StyledTableCell>Team Name</StyledTableCell>
                                                <StyledTableCell>Section</StyledTableCell>
                                                <StyledTableCell>Team Code</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredTeams.map((team) => (
                                                <StyledTableRow key={team.id}>
                                                    <TableCell>{team.id}</TableCell>
                                                    <TableCell>{team.team_name}</TableCell>
                                                    <TableCell>{team.section}</TableCell>
                                                    <TableCell>{team.section_team_id}</TableCell>
                                                </StyledTableRow>
                                            ))}
                                            {filteredTeams.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                        No teams found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </StyledCard>
                    </TabPanel>
                ))}
            </Box>
        </Box>
    );
};

export default AdminUsersScreen;