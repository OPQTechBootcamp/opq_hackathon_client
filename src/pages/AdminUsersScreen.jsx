// pages/admin/AdminUsersScreen.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsersAndTeams } from '../features/admin/adminUsersSlice';
import apiInstance from "../utils/apiInstance";
import { getToken } from "../utils/tokenUtils";
import {
    Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, styled, Box, Toolbar,
    AppBar, IconButton, Tooltip, Tabs, Tab, InputBase, alpha, Divider,
    useMediaQuery, useTheme, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, TextField, Snackbar, Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import JudgeIcon from '@mui/icons-material/Gavel';
import CoordinatorIcon from '@mui/icons-material/SupervisorAccount';
import AllUsersIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import LockResetIcon from '@mui/icons-material/LockReset';

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
    const [openResetDialog, setOpenResetDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

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

    const handleOpenResetDialog = (item, type) => {
        setSelectedItem({ ...item, type });
        setNewPassword('');
        setConfirmPassword('');
        setOpenResetDialog(true);
    };

    const handleCloseResetDialog = () => {
        setOpenResetDialog(false);
        setSelectedItem(null);
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setSnackbar({
                open: true,
                message: 'Passwords do not match',
                severity: 'error'
            });
            return;
        }

        if (newPassword.length < 6) {
            setSnackbar({
                open: true,
                message: 'Password must be at least 6 characters',
                severity: 'error'
            });
            return;
        }

        try {
            const authHeader = () => ({
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            await apiInstance.post(
                "/reset-password",
                {
                    type: selectedItem.type,
                    id: selectedItem.id,
                    newPassword: newPassword
                },
                authHeader()
            );

            setSnackbar({
                open: true,
                message: 'Password reset successful',
                severity: 'success'
            });
            handleCloseResetDialog();
        } catch (error) {
            console.error('Error resetting password:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.error || 'Password reset failed',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
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
                                                {user.role === 'admin' && (
                                                    <StyledTableCell align="right">Actions</StyledTableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredUsers.map(userItem => (
                                                <StyledTableRow key={userItem.id}>
                                                    <TableCell>{userItem.id}</TableCell>
                                                    <TableCell>{userItem.name}</TableCell>
                                                    <TableCell>{userItem.email}</TableCell>
                                                    <TableCell sx={{ textTransform: 'capitalize' }}>{userItem.role}</TableCell>
                                                    <TableCell align="right">
                                                        {user.role === 'admin' && (
                                                            <Tooltip title="Reset Password">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="primary"
                                                                    onClick={() => handleOpenResetDialog(userItem, 'user')}
                                                                >
                                                                    <LockResetIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                </StyledTableRow>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
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
                                                {user.role === 'admin' && (
                                                    <StyledTableCell align="right">Actions</StyledTableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredTeams.map(team => (
                                                <StyledTableRow key={team.id}>
                                                    <TableCell>{team.id}</TableCell>
                                                    <TableCell>{team.team_name}</TableCell>
                                                    <TableCell>{team.section}</TableCell>
                                                    <TableCell>{team.section_team_id}</TableCell>
                                                    <TableCell align="right">
                                                        {user.role === 'admin' && (
                                                            <Tooltip title="Reset Password">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="primary"
                                                                    onClick={() => handleOpenResetDialog(team, 'team')}
                                                                >
                                                                    <LockResetIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                </StyledTableRow>
                                            ))}
                                            {filteredTeams.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
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

            {/* Password Reset Dialog */}
            <Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
                <DialogTitle>
                    Reset Password for {selectedItem?.type === 'user' ? 'User' : 'Team'}: {selectedItem?.name || selectedItem?.team_name}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter a new password for this {selectedItem?.type === 'user' ? 'user' : 'team'}.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseResetDialog}>Cancel</Button>
                    <Button 
                        onClick={handleResetPassword} 
                        variant="contained" 
                        color="primary"
                        disabled={!newPassword || !confirmPassword}
                    >
                        Reset Password
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminUsersScreen;