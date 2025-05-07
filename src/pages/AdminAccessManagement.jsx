import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  CircularProgress,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Grid,
  Alert,
  useTheme,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  fetchTeams,
  fetchAssignments,
  assignJudges,
  unassignJudge,
} from "../features/admin/adminSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import BadgeIcon from "@mui/icons-material/Badge";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import InfoIcon from "@mui/icons-material/Info";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  "& > svg": {
    marginRight: theme.spacing(1),
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.25rem",
  },
}));

const AdminAccessManagement = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { users, teams, assignments, loading, error } = useSelector(
    (state) => state.admin
  );
  const { user } = useSelector((state) => state.auth); // Current logged-in user
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]); // Now an array for multiple selection
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchTeams());
    dispatch(fetchAssignments());
  }, [dispatch]);

  // Reset selected judges when teams change
  useEffect(() => {
    setSelectedJudges([]);
  }, [selectedTeams]);

  // Extract unique groups from teams
  const getGroups = () => {
    const groups = teams
      .map(
        (team) =>
          team.section ||
          (team.section_team_id ? team.section_team_id.split("_")[0] : null)
      )
      .filter(Boolean);
    return [...new Set(groups)].sort();
  };

  const groups = getGroups();

  // Extract section/group from team code (e.g., "A" from "A_1")
  const extractSectionFromTeamCode = (teamCode) => {
    if (!teamCode) return null;
    return teamCode.includes("_") ? teamCode.split("_")[0] : teamCode;
  };

  // Filter teams by selected group
  const filteredTeams = selectedGroup
    ? teams.filter((team) => {
        const teamGroup =
          team.section ||
          (team.section_team_id
            ? extractSectionFromTeamCode(team.section_team_id)
            : null);
        return teamGroup === selectedGroup;
      })
    : teams;

  // Get currently assigned judge IDs for a specific team
  const getAssignedJudgeIds = (teamId) => {
    if (!teamId) return [];
    return assignments
      .filter((assign) => assign.team_id === teamId)
      .map((assign) => {
        // Try to get judge ID - it might be stored in different ways
        return (
          assign.judge_id ||
          (assign.judge_name && findJudgeIdByName(assign.judge_name)) ||
          null
        );
      })
      .filter(Boolean); // Remove null/undefined values
  };

  // Helper function to find judge ID by name
  const findJudgeIdByName = (judgeName) => {
    const judge = users.find((u) => u.role === "judge" && u.name === judgeName);
    return judge ? judge.id : null;
  };

  // Get team section/group from team ID
  const getTeamSection = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(
      (t) => t.id === teamId || t.id === parseInt(teamId)
    );
    if (!team) return null;

    // Try to get section from section_team_id first
    if (team.section_team_id) {
      return extractSectionFromTeamCode(team.section_team_id);
    }
    // Or use section directly if available
    return team.section || null;
  };

  // Check if a judge is already assigned to any team in the specified section
  const isJudgeAssignedToSection = (judgeId, section) => {
    if (!judgeId || !section) return false;

    // Find the judge's name
    const judge = users.find((u) => u.id === judgeId);
    if (!judge) return false;

    const judgeName = judge.name;

    // Check if this judge name appears in any assignments in this section
    for (const assign of assignments) {
      // Skip if not the judge we're checking
      if (assign.judge_name !== judgeName) continue;

      // Get section from the assignment
      let assignmentSection = null;
      if (assign.section_team_id) {
        assignmentSection = extractSectionFromTeamCode(assign.section_team_id);
      } else if (assign.section) {
        assignmentSection = assign.section;
      }

      // If the judge is assigned to a team in the same section, return true
      if (assignmentSection === section) {
        return true;
      }
    }

    return false;
  };
// Check if a judge is already assigned to the selected team
const isJudgeAssignedToTeam = (judgeName, teamId) => {
    if (!judgeName || !teamId) return false;
  
    // Find the team's section_team_id
    const team = teams.find(t => t.id === teamId || t.id === parseInt(teamId));
    if (!team) return false;
    
    const teamSectionId = team.section_team_id;
    
    // Check if this judge is assigned to the specific team by matching section_team_id
    return assignments.some(assign => 
      assign.judge_name === judgeName && 
      assign.section_team_id === teamSectionId
    );
  };
// Updated to check if judge is assigned to the specific team
const shouldDisableJudge = (judgeId) => {
    if (selectedTeams.length === 0 || !judgeId) return false;
  
    // Find the judge's name
    const judge = users.find(u => u.id === judgeId);
    if (!judge) return false;
    
    const judgeName = judge.name;
  
    // Check for each selected team if the judge is already assigned
    for (const teamId of selectedTeams) {
      if (isJudgeAssignedToTeam(judgeName, teamId)) {
        return true;
      }
    }
  
    return false;
  };
  
 

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
    setSelectedTeams([]); // Reset team selection when group changes
  };

  // Updated to handle multiple teams
  const handleAssign = async () => {
    if (selectedTeams.length === 0 || selectedJudges.length === 0) return;
    try {
      await dispatch(
        assignJudges({
          teamIds: selectedTeams, // Send array of team IDs
          judgeIds: selectedJudges.map((j) => j.id),
        })
      ).unwrap();

      dispatch(fetchAssignments());
      setSelectedJudges([]);
      setSuccessMessage("Judges assigned successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (assignError) {
      console.error("Error assigning judges:", assignError);
    }
  };

  const handleUnassign = async (assignmentId) => {
    try {
      await dispatch(unassignJudge({ assignmentId })).unwrap();
      dispatch(fetchAssignments());
      setSuccessMessage("Judge unassigned successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (unassignError) {
      console.error("Error unassigning judge:", unassignError);
    }
  };

  // Check if user is admin
  const isAdmin = user && user.role === "admin";

  // Group assignments by team code and name
  const assignmentsByTeam = assignments.reduce((acc, assign) => {
    const key = `${assign.section_team_id || ""} - ${assign.team_name}`;
    if (!acc[key]) {
      acc[key] = {
        teamId: assign.team_id,
        teamName: assign.team_name,
        teamCode: assign.section_team_id,
        judges: [],
      };
    }
    acc[key].judges.push({
      id: assign.id,
      judgeName: assign.judge_name,
      judgeId: assign.judge_id || findJudgeIdByName(assign.judge_name), // Try to get ID from name if not available
    });
    return acc;
  }, {});

  // Debug: Log all judges with their assigned sections
  useEffect(() => {
    if (assignments.length > 0 && users.length > 0) {
      users
        .filter((u) => u.role === "judge")
        .forEach((judge) => {
          // Find assignments by matching judge name instead of ID
          const judgeAssignments = assignments.filter(
            (a) => a.judge_name === judge.name
          );

          const assignedSections = [
            ...new Set(
              judgeAssignments.map((a) => {
                return (
                  a.section ||
                  (a.section_team_id
                    ? extractSectionFromTeamCode(a.section_team_id)
                    : "Unknown")
                );
              })
            ),
          ];
        });
    }
  }, [assignments, users]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <StyledTypography variant={isMobile ? "h5" : "h4"} gutterBottom>
        <BadgeIcon fontSize={isMobile ? "medium" : "large"} /> Access Management
      </StyledTypography>

      {loading && <CircularProgress sx={{ mt: 2, mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Assign Judges Form */}
      <StyledPaper>
        <StyledTypography variant="h6" gutterBottom>
          <PersonAddIcon /> Assign Judges to Teams
        </StyledTypography>
        <Stack spacing={isMobile ? 2 : 3}>
          {/* Group Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Group</InputLabel>
            <Select
              value={selectedGroup}
              label="Select Series"
              onChange={handleGroupChange}
              size={isMobile ? "small" : "medium"}
            >
              {groups.map((group) => (
                <MenuItem key={group} value={group}>
                  Series {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Team Selection - Now Autocomplete for multiple selection */}
          <Autocomplete
            multiple
            options={filteredTeams}
            getOptionLabel={(option) =>
              option.section_team_id ||
              option.team_code ||
              option.team_name ||
              `Team ${option.id}`
            }
            value={selectedTeams
              .map((id) =>
                filteredTeams.find(
                  (team) => team.id === id || team.id === parseInt(id)
                )
              )
              .filter(Boolean)}
            onChange={(e, value) =>
              setSelectedTeams(value.map((team) => team.id))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Teams"
                placeholder="Search teams..."
                helperText="Select multiple teams to assign judges to"
                size={isMobile ? "small" : "medium"}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={
                    option.section_team_id ||
                    option.team_code ||
                    option.team_name
                  }
                  {...getTagProps({ index })}
                  color="primary"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              ))
            }
            disabled={!selectedGroup}
            disableCloseOnSelect
            sx={{
              "& .MuiAutocomplete-endAdornment": {
                top: isMobile ? "8px" : "12px",
              },
            }}
          />

          {/* Judge Selection with Assigned Judges Disabled */}
          <Autocomplete
            multiple
            options={users.filter((user) => user.role === "judge")}
            getOptionLabel={(option) => option.name}
            value={selectedJudges}
            onChange={(e, value) => setSelectedJudges(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Judges"
                placeholder="Search judges..."
                helperText="Judges already assigned to these teams or teams in the same group are disabled"
                size={isMobile ? "small" : "medium"}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  color="primary"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              ))
            }
            // Use the updated function to check if judge is assigned to any selected team's section
            getOptionDisabled={(option) => shouldDisableJudge(option.id)}
            renderOption={(props, option, { selected }) => {
              // For simplicity, we'll just display if the judge is disabled
              const isDisabled = shouldDisableJudge(option.id);
              let tooltipText = isDisabled
                ? "Already assigned to one of these teams or a team in the same group"
                : "";

              return (
                <li
                  {...props}
                  style={{
                    opacity: isDisabled ? 0.6 : 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{option.name}</span>
                  {isDisabled && (
                    <Tooltip title={tooltipText}>
                      <InfoIcon
                        fontSize="small"
                        sx={{ color: theme.palette.info.main }}
                      />
                    </Tooltip>
                  )}
                </li>
              );
            }}
            disabled={selectedTeams.length === 0}
            disableCloseOnSelect
            sx={{
              "& .MuiAutocomplete-endAdornment": {
                top: isMobile ? "8px" : "12px",
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleAssign}
            disabled={
              selectedTeams.length === 0 ||
              selectedJudges.length === 0 ||
              loading
            }
            startIcon={<PersonAddIcon />}
            sx={{ mt: 2 }}
            size={isMobile ? "small" : "medium"}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Assign Judges"
            )}
          </Button>
        </Stack>
      </StyledPaper>

      {/* Current Assignments List */}
      <StyledPaper>
        <StyledTypography variant="h6" gutterBottom>
          <FormatListNumberedIcon /> Current Assignments
        </StyledTypography>

        {Object.keys(assignmentsByTeam).length > 0 ? (
          <List sx={{ width: "100%", p: 0 }}>
            {Object.entries(assignmentsByTeam).map(
              ([teamKey, teamData], index) => (
                <React.Fragment key={teamKey}>
                  <Box sx={{ mb: 2, mt: index > 0 ? 3 : 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: isMobile ? "flex-start" : "center",
                        mb: 1,
                        flexDirection: isMobile ? "column" : "row",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: isMobile ? 1 : 0,
                        }}
                      >
                        <GroupIcon
                          sx={{ mr: 1, color: theme.palette.primary.main }}
                        />
                        {teamData.teamCode && (
                          <Chip
                            label={teamData.teamCode}
                            color="primary"
                            size="small"
                            sx={{ mr: 1, fontWeight: "bold" }}
                          />
                        )}
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {teamData.teamName}
                      </Typography>
                    </Box>

                    <Box sx={{ pl: { xs: 2, sm: 4 }, mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Assigned Judges:
                      </Typography>
                      <Grid container spacing={1}>
                        {teamData.judges.map((judge) => (
                          <Grid item xs={12} key={judge.id}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                p: { xs: 1, sm: 2 },
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`,
                                "&:hover": {
                                  bgcolor: theme.palette.action.hover,
                                },
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
              )
            )}
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
