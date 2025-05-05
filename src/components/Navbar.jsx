import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar,
  Container,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TeamIcon from "@mui/icons-material/Groups";
import LoginIcon from "@mui/icons-material/Login";
import LinkIcon from "@mui/icons-material/Link";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { logoutTeam } from "../features/team/teamSlice";
import { useNavigate } from "react-router-dom";

import logo from "../assets/OPQ-TECH-black-logo.jpg.png";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const teamAuth = useSelector((state) => state.team);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isUserMenuOpen = Boolean(userMenuAnchor);

  const handleLogout = () => {
    dispatch(logout());
    handleUserMenuClose();
    navigate("/");
  };

  const handleTeamLogout = () => {
    dispatch(logoutTeam());
    handleUserMenuClose();
    navigate("/");
  };

  const handleMobileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const navigateToImportantLinks = () => {
    navigate("/important-links");
    handleMobileMenuClose();
    handleUserMenuClose();
  };

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 200,
          borderRadius: 2,
          mt: 1,
          "& .MuiMenuItem-root": {
            py: 1.5,
          },
        },
      }}
    >
      {/* Important Links option for all users */}
      <MenuItem onClick={navigateToImportantLinks}>
        <LinkIcon sx={{ mr: 1, fontSize: 20 }} />
        Important Links
      </MenuItem>

      <Divider />

      {user ? (
        <>
          <MenuItem disabled>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  mr: 1,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "capitalize" }}
                >
                  {user.role}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <Divider />
          {user.role && (
            <MenuItem
              onClick={() => {
                handleMobileMenuClose();
                navigate(`/${user?.role}/dashboard`);
              }}
            >
              <DashboardIcon sx={{ mr: 1, fontSize: 20 }} />
              Dashboard
            </MenuItem>
          )}

          {user.role === "admin" && (
            <>
              <MenuItem
                onClick={() => {
                  handleMobileMenuClose();
                  navigate("/admin/register");
                }}
              >
                <PersonAddIcon sx={{ mr: 1, fontSize: 20 }} />
                Register User
              </MenuItem>
              <Divider />
            </>
          )}
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
            Logout
          </MenuItem>
        </>
      ) : teamAuth.token && teamAuth.team ? (
        <>
          <MenuItem disabled>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  mr: 1,
                  bgcolor: theme.palette.secondary.main,
                }}
              >
                <TeamIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {teamAuth.team.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Team Portal
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleMobileMenuClose();
              navigate("/teamDashboard");
            }}
          >
            <DashboardIcon sx={{ mr: 1, fontSize: 20 }} />
            Dashboard
          </MenuItem>
          <MenuItem onClick={handleTeamLogout}>
            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
            Logout
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem
            onClick={() => {
              handleMobileMenuClose();
              navigate("/team/login");
            }}
          >
            <LoginIcon sx={{ mr: 1, fontSize: 20 }} />
            Team Login
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMobileMenuClose();
              navigate("/team/register");
            }}
          >
            <PersonAddIcon sx={{ mr: 1, fontSize: 20 }} />
            Team Register
          </MenuItem>
        </>
      )}
    </Menu>
  );

  const userMenu = (
    <Menu
      anchorEl={userMenuAnchor}
      open={isUserMenuOpen}
      onClose={handleUserMenuClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 200,
          borderRadius: 2,
          mt: 1,
          "& .MuiMenuItem-root": {
            py: 1.5,
          },
        },
      }}
    >
      {/* Important Links option for all users */}
      <MenuItem onClick={navigateToImportantLinks}>
        <LinkIcon sx={{ mr: 1, fontSize: 20 }} />
        Important Links
      </MenuItem>

      <Divider />

      {user ? (
        <>
          <MenuItem disabled>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  mr: 1,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "capitalize" }}
                >
                  {user.role}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <Divider />
          {user.role === "admin" && (
            <>
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  navigate("/admin/dashboard");
                }}
              >
                <DashboardIcon sx={{ mr: 1, fontSize: 20 }} />
                Dashboard
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  navigate("/admin/register");
                }}
              >
                <PersonAddIcon sx={{ mr: 1, fontSize: 20 }} />
                Register User
              </MenuItem>
              <Divider />
            </>
          )}
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
            Logout
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem
            onClick={() => {
              handleUserMenuClose();
              navigate("/teamDashboard");
            }}
          >
            <DashboardIcon sx={{ mr: 1, fontSize: 20 }} />
            Dashboard
          </MenuItem>
          <MenuItem onClick={handleTeamLogout}>
            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
            Logout
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "white",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo and Title */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <Box
              component="img"
              src={logo}
              alt="Hackathon Platform Logo"
              sx={{
                height: 60,
                mr: 2,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
          </Box>

          {/* Mobile Menu */}
          {isMobile ? (
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              sx={{ color: theme.palette.primary.main }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            /* Desktop Navigation */
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* Important Links button visible for all users */}
              <Button
                color="primary"
                variant="text"
                startIcon={<LinkIcon />}
                onClick={navigateToImportantLinks}
                sx={{
                  mr: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Important Links
              </Button>

              {user ? (
                /* User is logged in */
                <Button
                  color="inherit"
                  onClick={handleUserMenuOpen}
                  endIcon={<ExpandMoreIcon />}
                  sx={{
                    color: "text.primary",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1,
                        bgcolor: theme.palette.primary.main,
                        fontSize: "0.875rem",
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, lineHeight: 1.2 }}
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: "capitalize", lineHeight: 1 }}
                      >
                        {user.role}
                      </Typography>
                    </Box>
                  </Box>
                </Button>
              ) : teamAuth.token && teamAuth.team ? (
                /* Team is logged in */
                <Button
                  color="inherit"
                  onClick={handleUserMenuOpen}
                  endIcon={<ExpandMoreIcon />}
                  sx={{
                    color: "text.primary",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1,
                        bgcolor: theme.palette.secondary.main,
                      }}
                    >
                      <TeamIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, lineHeight: 1.2 }}
                      >
                        {teamAuth.team.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ lineHeight: 1 }}
                      >
                        Team Portal
                      </Typography>
                    </Box>
                  </Box>
                </Button>
              ) : (
                /* No one is logged in */
                <>
                  <Button
                    color="secondary"
                    variant="text"
                    startIcon={<TeamIcon />}
                    onClick={() => navigate("/team/login")}
                    sx={{
                      mr: 1,
                      textTransform: "none",
                      fontWeight: 500,
                    }}
                  >
                    Team Login
                  </Button>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => navigate("/team/register")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 500,
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    Register Team
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
      {renderMobileMenu}
      {userMenu}
    </AppBar>
  );
};

export default Navbar;
