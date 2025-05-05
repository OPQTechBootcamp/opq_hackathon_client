import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Tooltip, IconButton, Grid, 
  Typography, Box, Paper, CircularProgress, 
  Chip, useTheme, useMediaQuery, InputAdornment
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CodeIcon from '@mui/icons-material/Code';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PaletteIcon from '@mui/icons-material/Palette';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const criteriaList = [
  { 
    key: 'innovation', 
    label: 'Innovation & Creativity', 
    description: 'Uniqueness of the idea and originality.',
    icon: <LightbulbIcon />,
    maxScore: 10
  },
  { 
    key: 'technical', 
    label: 'Technical Implementation', 
    description: 'Use of AI/ML, backend/frontend quality, APIs, models.',
    icon: <CodeIcon />,
    maxScore: 10
  },
  { 
    key: 'relevance', 
    label: 'Problem Relevance', 
    description: 'How well does the project address a real-world problem?',
    icon: <TipsAndUpdatesIcon />,
    maxScore: 10
  },
  { 
    key: 'feasibility', 
    label: 'Feasibility & Scalability', 
    description: 'Is it implementable and scalable?',
    icon: <AssignmentIcon />,
    maxScore: 10
  },
  { 
    key: 'design', 
    label: 'UI/UX & Design', 
    description: 'User-friendliness and visual appeal.',
    icon: <PaletteIcon />,
    maxScore: 10
  },
  { 
    key: 'collaboration', 
    label: 'Team Collaboration', 
    description: 'Teamwork and communication.',
    icon: <GroupsIcon />,
    maxScore: 10
  },
  { 
    key: 'presentation', 
    label: 'Presentation & Demo', 
    description: 'Clarity, storytelling, technical depth during pitch.',
    icon: <PresentToAllIcon />,
    maxScore: 10
  },
  { 
    key: 'bonus', 
    label: 'Bonus Points', 
    description: 'Any surprise innovation or standout features.',
    icon: <EmojiEventsIcon />,
    maxScore: 5
  }
];

const EvaluationFormModal = ({ open, handleClose, team, roundId, onSubmit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opening the modal with a new team
  useEffect(() => {
    if (open) {
      const initialScores = {};
      criteriaList.forEach(criterion => {
        initialScores[criterion.key] = '';
      });
      setScores(initialScores);
      setComments('');
      setErrors({});
    }
  }, [open, team]);

  const handleScoreChange = (key, value) => {
    const criterion = criteriaList.find(c => c.key === key);
    const maxScore = criterion ? criterion.maxScore : 10;
    
    // Only allow valid numbers for the specific criterion
    if (value === '' || (Number(value) >= 0 && Number(value) <= maxScore)) {
      setScores({ ...scores, [key]: value });
      // Clear any error for this field
      if (errors[key]) {
        const newErrors = { ...errors };
        delete newErrors[key];
        setErrors(newErrors);
      }
    }
  };

  const handleCommentsChange = (e) => {
    setComments(e.target.value);
    // Clear comments error if needed
    if (errors.comments) {
      const newErrors = { ...errors };
      delete newErrors.comments;
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if all criteria have scores
    criteriaList.forEach(criterion => {
      const score = scores[criterion.key];
      if (score === undefined || score === null || score === '') {
        newErrors[criterion.key] = 'Required';
      } else {
        const numScore = Number(score);
        if (isNaN(numScore) || numScore < 0 || numScore > criterion.maxScore) {
          newErrors[criterion.key] = `Score must be 0-${criterion.maxScore}`;
        }
      }
    });
    
    // Check comments
    if (!comments.trim()) {
      newErrors.comments = 'Please provide feedback comments';
    } else if (comments.trim().length < 10) {
      newErrors.comments = 'Comments should be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      const evaluationData = {
        teamId: team?.id || team?.team_id,
        roundId: roundId,
        scores,
        comments,
        totalScore: calculateTotalScore()
      };
      
      onSubmit(evaluationData);
      
      // Reset form (this will be handled by the parent when it closes the modal)
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  // Calculate total score
  const calculateTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => {
      const numScore = Number(score || 0);
      return isNaN(numScore) ? sum : sum + numScore;
    }, 0);
  };
  
  // Calculate maximum possible total
  const calculateMaxPossibleScore = () => {
    return criteriaList.reduce((sum, criterion) => sum + criterion.maxScore, 0);
  };

  return (
    <Dialog 
      open={open} 
      onClose={isSubmitting ? undefined : handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ 
        sx: { 
          borderRadius: 2,
          overflow: 'hidden'
        } 
      }}
      fullScreen={isMobile}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Evaluate Team: {team?.team_name}
        </Typography>
        <Box>
          <Chip
            label={`Team Code: ${team?.team_code || ''}`}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              mr: 2,
              fontWeight: 'bold'
            }}
          />
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: isMobile ? 2 : 3 }}>
        {/* Explanation and Instructions */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Evaluation Instructions
          </Typography>
          <Typography variant="body2">
            Rate each criterion on the specified scale. Most criteria range from 0-10, while 
            Bonus Points range from 0-5. Hover over the info icon for detailed descriptions.
            All fields are required before submission.
          </Typography>
        </Paper>

        {/* Scoring Section */}
        <Grid container spacing={isMobile ? 2 : 3}>
          {criteriaList.map((criterion) => (
            <Grid item xs={12} sm={6} key={criterion.key}>
              <Paper
                elevation={criterion.key === 'bonus' ? 2 : 1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: '100%',
                  border: criterion.key === 'bonus' ? `1px solid ${theme.palette.warning.light}` : 'none',
                  bgcolor: criterion.key === 'bonus' ? theme.palette.warning.light + '15' : 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    color: criterion.key === 'bonus' ? theme.palette.warning.main : theme.palette.primary.main, 
                    display: 'flex', 
                    mr: 1 
                  }}>
                    {criterion.icon}
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mr: 1 }}>
                    {criterion.label}
                  </Typography>
                  <Tooltip 
                    title={criterion.description}
                    arrow
                    placement="top"
                  >
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {criterion.key === 'bonus' && (
                  <Typography variant="caption" color="warning.dark" sx={{ display: 'block', mb: 1 }}>
                    Special category: Range 0-5 points
                  </Typography>
                )}

                <TextField
                  label={`Score (0-${criterion.maxScore})`}
                  value={scores[criterion.key]}
                  onChange={(e) => handleScoreChange(criterion.key, e.target.value)}
                  type="number"
                  fullWidth
                  size="small"
                  variant="outlined"
                  inputProps={{ 
                    min: 0, 
                    max: criterion.maxScore, 
                    step: 1 
                  }}
                  error={!!errors[criterion.key]}
                  helperText={errors[criterion.key]}
                  sx={{ mt: 1 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        /{criterion.maxScore}
                      </InputAdornment>
                    ),
                    sx: {
                      ...(criterion.key === 'bonus' && {
                        color: theme.palette.warning.dark,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.warning.main,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.warning.dark,
                        },
                      })
                    }
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Total Score Summary */}
        <Paper 
          elevation={2} 
          sx={{ 
            mt: 4, 
            p: 2, 
            borderRadius: 2, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: theme.palette.primary.light + '22'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Total Score
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              border: `2px solid ${theme.palette.primary.main}`,
              borderRadius: 2,
              px: 2,
              py: 0.5,
              bgcolor: 'white'
            }}
          >
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {calculateTotalScore()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              / {calculateMaxPossibleScore()}
            </Typography>
          </Box>
        </Paper>

        {/* Comments Section */}
        <Paper elevation={1} sx={{ mt: 4, p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Evaluation Comments
          </Typography>
          <TextField
            label="Provide detailed feedback"
            placeholder="Share specific strengths, areas for improvement, and overall impression..."
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={comments}
            onChange={handleCommentsChange}
            error={!!errors.comments}
            helperText={errors.comments}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: theme.palette.grey[50] }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 6, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
          color="primary"
          sx={{ 
            borderRadius: 6, 
            px: 4,
            position: 'relative'
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={24} sx={{ color: 'white', position: 'absolute' }} />
              <span style={{ opacity: 0 }}>Submit Evaluation</span>
            </>
          ) : 'Submit Evaluation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EvaluationFormModal;