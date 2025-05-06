import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GavelIcon from '@mui/icons-material/Gavel';

const JudgingCriteria = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Rating scale data
  const ratingScale = [
    { range: '0 – 2', icon: '🚫', rating: 'Very Poor', description: 'Idea lacks relevance, no effort or poor execution, no originality' },
    { range: '2 – 3', icon: '⚠️', rating: 'Poor', description: 'Weak concept or execution, very minimal technical or creative input' },
    { range: '3 – 5', icon: '🔻', rating: 'Below Average', description: 'Idea is partially formed, limited innovation or incomplete implementation' },
    { range: '5 – 7', icon: '⚙️', rating: 'Average', description: 'Meets basic expectations, standard execution, moderate impact' },
    { range: '7 – 8', icon: '📈', rating: 'Above Average', description: 'Solid implementation, good technical depth, well-thought design' },
    { range: '8 – 9', icon: '⭐', rating: 'Good to Very Good', description: 'Impressive project, well-structured, impactful and near-production quality' },
    { range: '9 – 10', icon: '🏆', rating: 'Excellent', description: 'Exceptional work, highly innovative, technically sound, and presentation-ready' }
  ];

  // Evaluation criteria data
  const evaluationCriteria = [
    { id: 1, name: 'Innovation & Creativity', description: 'Uniqueness of the idea and originality of the approach', maxScore: 10 },
    { id: 2, name: 'Technical Implementation', description: 'Use of AI/ML, tech stack integration, backend/frontend performance, API usage, and model accuracy', maxScore: 10 },
    { id: 3, name: 'Problem Relevance', description: 'Alignment of the solution with a real-world problem or domain-specific challenge', maxScore: 10 },
    { id: 4, name: 'Feasibility & Scalability', description: 'Practicality of implementation and potential to scale or launch as an MVP', maxScore: 10 },
    { id: 5, name: 'UI/UX & Design', description: 'User experience, intuitive design, and visual appeal', maxScore: 10 },
    { id: 6, name: 'Team Collaboration', description: 'Synergy among team members, task distribution, and communication', maxScore: 10 },
    { id: 7, name: 'Presentation & Demo', description: 'Clarity of pitch, confidence, storytelling ability, and technical depth', maxScore: 10 },
    { id: 8, name: 'Bonus Points', description: 'Out-of-the-box thinking, unexpected features, WOW factor, or extra effort', maxScore: 5 }
  ];

  return (
    <Container maxWidth="lg" sx={{ overflow: 'hidden' }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          my: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.background.paper})`,
        }}
      >
        {/* Header section */}
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '1.5rem' : '2.125rem'
            }}
          >
            <GavelIcon sx={{ mr: 1, fontSize: isMobile ? 24 : 32 }} />
            Hackathon Judging Criteria
          </Typography>
          <Typography 
            variant="h5" 
            component="div" 
            color="text.secondary" 
            gutterBottom
            sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}
          >
            Code Braker Challenge
          </Typography>
        </Box>

        {/* Event details */}
        <Card 
          variant="outlined" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            borderColor: theme.palette.primary.light,
            backgroundColor: '#f8f9fa',
          }}
        >
          <CardContent sx={{ py: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  <CalendarMonthIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="body1" fontWeight="medium">
                    Event Date: 10th & 11th May 2025
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  <LocationOnIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="body1" fontWeight="medium">
                    Venue: Aditya Layout, Rajarajeshwari Nagar, Bengaluru
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Evaluation Rubric */}
        <Box mb={4}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              fontSize: isMobile ? '1.2rem' : '1.5rem'
            }}
          >
            <AssessmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Evaluation Rubric
          </Typography>

          {/* Table Container with Horizontal Scroll for Mobile */}
          <Box sx={{ 
            width: '100%',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.light,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.grey[200],
              borderRadius: '4px',
            }
          }}>
            <TableContainer 
              component={Paper} 
              elevation={2} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                minWidth: isMobile ? 500 : 'auto', // Set minimum width for mobile to ensure scrolling works
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white', width: isMobile ? '25%' : 'auto' }}>Criteria</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white', width: isMobile ? '55%' : 'auto' }}>Description</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white', width: isMobile ? '20%' : 'auto' }}>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evaluationCriteria.map((criterion) => (
                    <TableRow 
                      key={criterion.id}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                        '&:hover': { backgroundColor: theme.palette.primary.light + '20' },
                      }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ 
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          borderLeft: criterion.id === 8 ? `4px solid ${theme.palette.warning.main}` : 'none',
                        }}
                      >
                        {criterion.name}
                      </TableCell>
                      <TableCell>{criterion.description}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`/${criterion.maxScore}`} 
                          color={criterion.id === 8 ? "warning" : "primary"}
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                      Total Possible Score
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label="/75" 
                        color="secondary"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          {/* Mobile scrolling indicator */}
          {isMobile && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 1, 
                color: theme.palette.text.secondary,
                fontStyle: 'italic'
              }}
            >
              Swipe horizontally to see full table
            </Typography>
          )}
        </Box>

        {/* Notes for Judges */}
        <Box mb={4}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              fontSize: isMobile ? '1.2rem' : '1.5rem'
            }}
          >
            <EmojiEventsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Notes for Judges
          </Typography>

          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <ul style={{ paddingLeft: isMobile ? 16 : 20, marginTop: 0, marginBottom: 0 }}>
                <li>
                  <Typography variant="body1" paragraph>
                    Each primary criterion is rated out of 10, and Bonus Points are out of 5.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" paragraph>
                    Total Possible Score = 70 + 5 (Bonus) = 75
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Use the official evaluation sheet or digital platform to submit scores.
                  </Typography>
                </li>
              </ul>
            </CardContent>
          </Card>
        </Box>

        {/* Score Interpretation Guide */}
        <Box mb={4}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              fontSize: isMobile ? '1.2rem' : '1.5rem'
            }}
          >
            <ScoreboardIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Score Interpretation Guide
          </Typography>

          <Typography variant="body1" paragraph>
            Each team will undergo multiple evaluations by different judges across all criteria. The final average score per criterion will be calculated and converted into a 10-point rating system.
            Judges are allowed to provide decimal scores (e.g., 2.5, 3.5, 6.5) for more accuracy.
          </Typography>
        </Box>

        {/* Rating Scale */}
        <Box>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              fontSize: isMobile ? '1.2rem' : '1.5rem'
            }}
          >
            <StarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Rating Scale
          </Typography>

          {/* Table Container with Horizontal Scroll for Mobile */}
          <Box sx={{ 
            width: '100%',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.light,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.grey[200],
              borderRadius: '4px',
            }
          }}>
            <TableContainer 
              component={Paper} 
              elevation={2} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                minWidth: isMobile ? 500 : 'auto', // Set minimum width for mobile
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white', width: isMobile ? '20%' : 'auto' }}>Score Range</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white', width: isMobile ? '30%' : 'auto' }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white', width: isMobile ? '50%' : 'auto' }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ratingScale.map((rating, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                        '&:hover': { backgroundColor: theme.palette.primary.light + '20' },
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {rating.range}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mr: 1,
                              fontSize: '1.2rem',
                            }}
                          >
                            {rating.icon}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {rating.rating}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{rating.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          {/* Mobile scrolling indicator */}
          {isMobile && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 1, 
                color: theme.palette.text.secondary,
                fontStyle: 'italic'
              }}
            >
              Swipe horizontally to see full table
            </Typography>
          )}
        </Box>

        {/* Additional Notes */}
        <Box mt={4}>
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              mb: 2,
              fontSize: isMobile ? '1rem' : '1.25rem'
            }}
          >
            📌 Additional Notes:
          </Typography>

          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <ul style={{ paddingLeft: isMobile ? 16 : 20, marginTop: 0, marginBottom: 0 }}>
                <li>
                  <Typography variant="body1" paragraph>
                    Use decimals if the project falls between categories (e.g., 6.5 if slightly better than average).
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" paragraph>
                    Be consistent across all teams.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Scores will be averaged across judges and converted into the final rating out of 10.
                  </Typography>
                </li>
              </ul>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Container>
  );
};

export default JudgingCriteria;