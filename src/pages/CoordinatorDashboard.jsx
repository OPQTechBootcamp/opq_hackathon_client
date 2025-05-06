import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Icon,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupsIcon from "@mui/icons-material/Groups";
import LinkIcon from "@mui/icons-material/Link";
import GavelIcon from "@mui/icons-material/Gavel";

// Styled Components for enhanced UI
const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(6),
  marginBottom: theme.spacing(6),
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  height: 160,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  cursor: "pointer",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.08)",
    boxShadow: theme.shadows[5],
  },
}));

const CardIcon = styled(Icon)(({ theme }) => ({
  fontSize: 48,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.dark,
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

const CardSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.9rem",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(4),
  textAlign: "center",
}));

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  const navigateToJudgeAssignment = () => {
    navigate("/admin/accessManagement");
  };

  const navigateToSection = () => {
    navigate("/coordinator/section-management");
  };
  
  const navigateToTeams = () => {
    navigate("/user-teams");
  };

  const navigateToImportantLinks = () => {
    navigate("/important-links");
  };
  const navigateToJudgingCriteria= () => {
    navigate("/judging-criteria");
  };
  const navigateToJudgeList = () => {
    navigate("/admin/judgeManagement");
  };
  
  const cardData = [
    {
      title: "Judge Assignment",
      subtitle: "Assign judges to teams",
      icon: AssignmentIndIcon,
      onClick: navigateToJudgeAssignment,
    },    
    {
      title: "Judge Directory",
      subtitle: "View judge information",
      icon: FormatListBulletedIcon,
      onClick: navigateToJudgeList,
    },
    // {
    //     title: 'Section',
    //     subtitle: 'Manage Team - Section assignment',
    //     icon: SegmentIcon,
    //     onClick: navigateToSection,
    // },
    {
      title: "Teams",
      subtitle: "View participants and teams",
      icon: GroupsIcon,
      onClick: navigateToTeams,
    },
    {
      title: "Important Links",
      subtitle: "Access event resources",
      icon: LinkIcon,
      onClick: navigateToImportantLinks,
    },
    {
      title: "Hackathon Judging Criteria",
      subtitle: "",
      icon: GavelIcon,
      onClick: navigateToJudgingCriteria,
    }
  ];

  let gridCols;
  if (isSm) {
    gridCols = 1;
  } else if (isMd) {
    gridCols = 2;
  } else {
    gridCols = 3;
  }

  return (
    <StyledContainer maxWidth="lg">
      <StyledTypography variant="h4" component="h1" gutterBottom>
        Coordinator Dashboard
      </StyledTypography>

      <Grid container spacing={4}>
        {cardData.map((card, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={gridCols === 3 ? 4 : 6}
            lg={gridCols === 3 ? 4 : 6}
            key={index}
          >
            <DashboardCard onClick={card.onClick}>
              <CardActionArea
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <CardContent
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CardIcon component={card.icon} />
                  <CardTitle variant="h6">{card.title}</CardTitle>
                  <CardSubtitle variant="body2">{card.subtitle}</CardSubtitle>
                </CardContent>
              </CardActionArea>
            </DashboardCard>
          </Grid>
        ))}
      </Grid>
    </StyledContainer>
  );
};

export default CoordinatorDashboard;