// pages/admin/AdminUsersScreen.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsersAndTeams } from '../features/admin/adminUsersSlice';
import {
    Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, styled, Box, Toolbar,
    AppBar, IconButton, Tooltip, Tabs, Tab, InputBase, alpha, Divider,
    useMediaQuery, useTheme
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

const ResponsiveTab = styled(Tab)(({ theme }) => ({
    [theme.breakpoints.down('sm')]: {
        minWidth: 'auto',
        padding: theme.spacing(1),
        fontSize: theme.typography.pxToRem(12),
    },
}));

const TabPanel = ({ children, value, index, ...other }) => (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
        {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
);

const AdminUsersScreen = () => {
    const dispatch = useDispatch();
    const { users, teams, loading, error } = useSelector((state) => state.adminUsers);
    const { user } = useSelector((state) => state.auth);
    const [userTabValue, setUserTabValue] = useState(0);
    const [teamTabValue, setTeamTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    // Build tab configuration based on role
    const userTabs = [
        { label: 'All Users', icon: <AllUsersIcon fontSize="small" />, roleFilter: null },
        { label: 'Admins', icon: <AdminIcon fontSize="small" />, roleFilter: 'admin' },
        { label: 'Judges', icon: <JudgeIcon fontSize="small" />, roleFilter: 'judge' },
        { label: 'Coordinators', icon: <CoordinatorIcon fontSize="small" />, roleFilter: 'coordinator' },
        { label: 'Faculty', icon: <CoordinatorIcon fontSize="small" />, roleFilter: 'faculty' },
    ];

    const visibleUserTabs = (user.role === 'coordinator' || user.role === 'faculty') ? userTabs.slice(2) : userTabs;

    const filteredUsers = users.filter((userItem) => {
        const matchesSearch =
            searchQuery === '' ||
            userItem.name.toLowerCase().includes(searchQuery) ||
            userItem.email.toLowerCase().includes(searchQuery);

        const currentTab = visibleUserTabs[userTabValue];
        if (!currentTab || !currentTab.roleFilter) return matchesSearch;
        return userItem.role === currentTab.roleFilter && matchesSearch;
    });

    const sections = ['All Groups', ...new Set(teams.map(t => t.section && `Series ${t.section}`).filter(Boolean))].sort();

    const filteredTeams = teams.filter(team => {
        const matchesSearch =
            searchQuery === '' ||
            team.team_name.toLowerCase().includes(searchQuery) ||
            (team.section_team_id && team.section_team_id.toLowerCase().includes(searchQuery));

        if (teamTabValue === 0) return matchesSearch;
        const sectionName = `Series ${team.section}`;
        return sections[teamTabValue] === sectionName && matchesSearch;
    });

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
        </Box>
    );

    if (error) return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <AppBar position="static" color="default" elevation={1} sx={{ mb: 3, borderRadius: 1 }}>
                <Toolbar sx={{ flexDirection: isMobile ? 'column' : 'row', py: isMobile ? 1 : 0 }}>
                    <Typography variant="h6" color="inherit" sx={{
                        flexGrow: 1,
                        mb: isMobile ? 1 : 0,
                        fontSize: isMobile ? '1rem' : '1.25rem'
                    }}>
                        Users & Teams Management
                    </Typography>
                    <Box sx={{ display: 'flex', width: isMobile ? '100%' : 'auto', alignItems: 'center' }}>
                        <Search sx={{ flexGrow: 1 }}>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search…"
                                inputProps={{ 'aria-label': 'search' }}
                                onChange={handleSearchChange}
                                fullWidth
                            />
                        </Search>
                        <Tooltip title="Refresh Data">
                            <IconButton onClick={handleRefresh} color="primary" sx={{ ml: 1 }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Users Tabs */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={userTabValue}
                        onChange={handleUserTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons={isMobile ? "auto" : false}
                        allowScrollButtonsMobile
                    >
                        {visibleUserTabs.map((tab, index) => (
                            <ResponsiveTab
                                key={index}
                                icon={tab.icon}
                                iconPosition="start"
                                label={isMobile ? '' : tab.label}
                                aria-label={tab.label}
                            />
                        ))}
                    </Tabs>
                </Box>

                {visibleUserTabs.map((tab, index) => (
                    <TabPanel key={index} value={userTabValue} index={index}>
                        <StyledCard>
                            <CardContent sx={{ p: 0 }}>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>ID</StyledTableCell>
                                                <StyledTableCell>Name</StyledTableCell>
                                                <StyledTableCell>Email</StyledTableCell>
                                                <StyledTableCell>Role</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredUsers.map(user => (
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
                                                        No {tab.label.toLowerCase()} found
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

            <Divider sx={{ my: 4 }} />

            {/* Teams Section */}
            <Box sx={{ mt: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={teamTabValue}
                        onChange={handleTeamTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        {sections.map((section, index) => (
                            <ResponsiveTab
                                key={index}
                                icon={<GroupsIcon fontSize="small" />}
                                iconPosition="start"
                                label={isMobile ? section.replace("Series ", "S") : section}
                                aria-label={section}
                            />
                        ))}
                    </Tabs>
                </Box>

                {sections.map((section, index) => (
                    <TabPanel key={index} value={teamTabValue} index={index}>
                        <StyledCard>
                            <CardContent sx={{ p: 0 }}>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>ID</StyledTableCell>
                                                <StyledTableCell>Team Name</StyledTableCell>
                                                <StyledTableCell>Series</StyledTableCell>
                                                <StyledTableCell>Team Code</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredTeams.map(team => (
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
