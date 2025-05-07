import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  resetRegistrationStatus,
} from "../features/registration/registrationSlice";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4caf50", // Professional green
    },
    secondary: {
      main: "#ff9800", // Accent orange
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
      marginBottom: "1.5rem",
      textAlign: "center",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "2rem",
          borderRadius: 8,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        margin: "normal",
        fullWidth: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "0.75rem 1.5rem",
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
  },
});



const RegisterUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, status, message } = useSelector(
    (state) => state.register
  );  
  
  const { user} = useSelector(
    (state) => state.auth
  );
  let roles;
  if (user.role === "admin") {
    roles = ["Admin", "Coordinator", "Faculty", "Volunteer"];
  } else {
    roles = ["Faculty", "Volunteer"];
  }
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  useEffect(() => {
    if (status === "error") {
      const errorMessage = error || message || "Registration failed";
      setRegistrationError(errorMessage);
    }
    if (status === "success") {
      setRegistrationSuccess(true);
      setForm({ name: "", email: "", password: "", role: "" });
    }
  }, [status, error, message]);

  useEffect(() => {
    let timer;
    if (status === "fulfilled") {
      timer = setTimeout(() => {
        dispatch(resetRegistrationStatus());
        setRegistrationSuccess(false);
        setRegistrationError("");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [dispatch, status]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(registerUser(form));
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box
          mt={6}
          p={4}
          boxShadow={3}
          borderRadius={2}
          sx={{ backgroundColor: "white" }}
        >
          <PersonAddIcon
            sx={{
              fontSize: 40,
              color: "primary.main",
              display: "block",
              margin: "0 auto 1rem",
            }}
          />
          <Typography variant="h5" mb={3} textAlign="center" color="primary">
            Register New User
          </Typography>
          {registrationSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              User registered successfully!
            </Alert>
          )}
          {registrationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registrationError}
            </Alert>
          )}
          {error && !registrationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Registration failed. Please try again.
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              margin="normal"
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              margin="normal"
              fullWidth
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              margin="normal"
              fullWidth
            />
            <TextField
              label="Role"
              name="role"
              select
              required
              value={form.role}
              onChange={handleChange}
              margin="normal"
              fullWidth
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role.toUpperCase()}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default RegisterUser;
