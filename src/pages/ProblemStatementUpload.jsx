import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  styled
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import ViewListIcon from '@mui/icons-material/ViewList';
import DeleteIcon from '@mui/icons-material/Delete';
import apiInstance from '../utils/apiInstance';
import { getToken } from '../utils/tokenUtils';
import ProblemStatementsTable from "../components/ProblemStatementsTable";

const MAX_FILE_SIZE_MB = 5;

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[6],
  }
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FilePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ProblemStatementUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [overviewFile, setOverviewFile] = useState(null);
  const [inDepthFile, setInDepthFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const validateFile = (file) => {
    if (!file) return true;
    const isPdf = file.type === 'application/pdf';
    const isUnderLimit = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
    return { isPdf, isUnderLimit };
  };

  const handleOverviewFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const { isPdf, isUnderLimit } = validateFile(file);
      if (!isPdf) {
        setStatusMessage({ type: 'error', text: 'Overview file must be a PDF.' });
        return;
      }
      if (!isUnderLimit) {
        setStatusMessage({ type: 'error', text: `Overview file must be ≤ ${MAX_FILE_SIZE_MB} MB.` });
        return;
      }
      setOverviewFile(file);
      setStatusMessage(null);
    }
  };

  const handleInDepthFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const { isPdf, isUnderLimit } = validateFile(file);
      if (!isPdf) {
        setStatusMessage({ type: 'error', text: 'In-depth file must be a PDF.' });
        return;
      }
      if (!isUnderLimit) {
        setStatusMessage({ type: 'error', text: `In-depth file must be ≤ ${MAX_FILE_SIZE_MB} MB.` });
        return;
      }
      setInDepthFile(file);
      setStatusMessage(null);
    }
  };

  const handleRemoveFile = (fileType) => {
    if (fileType === 'overview') {
      setOverviewFile(null);
    } else {
      setInDepthFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!title) {
      setStatusMessage({ type: 'error', text: 'Title is required.' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (overviewFile) formData.append('overview_file', overviewFile);
    if (inDepthFile) formData.append('in_depth_file', inDepthFile);

    setLoading(true);
    try {
      const response = await apiInstance.post('/admin/problem-statement/upload', formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setStatusMessage({ type: 'success', text: 'Problem statement uploaded successfully.' });
        setTitle('');
        setDescription('');
        setOverviewFile(null);
        setInDepthFile(null);
      } else {
        setStatusMessage({ type: 'error', text: 'Failed to upload. Please try again.' });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setStatusMessage({ type: 'error', text: err.response.data.message });
      } else {
        setStatusMessage({ type: 'error', text: 'Server error during upload.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={4} justifyContent="center">
      <Grid item xs={12} md={8} lg={6}>
        <StyledPaper>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h5" fontWeight="medium" color="primary">
              Upload Problem Statement
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setShowTable((prev) => !prev)}
              startIcon={<ViewListIcon />}
            >
              {showTable ? 'Hide' : 'View'} Problem Statements
            </Button>
          </Stack>

          {statusMessage && (
            <Alert 
              severity={statusMessage.type} 
              sx={{ mb: 3, borderRadius: 1 }}
              onClose={() => setStatusMessage(null)}
            >
              {statusMessage.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  variant="outlined"
                  placeholder="Enter a descriptive title"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Provide additional details about this problem statement"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                  File Attachments
                </Typography>
                
                <Stack spacing={3}>
                  {/* Overview File Upload */}
                  <Box>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                      Overview File (PDF, ≤ 5 MB, optional)
                    </Typography>
                    
                    <Button
                      component="label"
                      variant={overviewFile ? "outlined" : "contained"}
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 1 }}
                      color="primary"
                    >
                      {overviewFile ? "Change File" : "Upload File"}
                      <VisuallyHiddenInput 
                        type="file"
                        accept="application/pdf"
                        onChange={handleOverviewFileChange}
                      />
                    </Button>
                    
                    {overviewFile && (
                      <FilePreview>
                        <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {overviewFile.name} ({(overviewFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </Typography>
                        <Tooltip title="Remove file">
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveFile('overview')}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </FilePreview>
                    )}
                  </Box>
                  
                  {/* In-Depth File Upload */}
                  <Box>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                      In-Depth File (PDF, ≤ 5 MB, optional)
                    </Typography>
                    
                    <Button
                      component="label"
                      variant={inDepthFile ? "outlined" : "contained"}
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 1 }}
                      color="secondary"
                    >
                      {inDepthFile ? "Change File" : "Upload File"}
                      <VisuallyHiddenInput 
                        type="file"
                        accept="application/pdf"
                        onChange={handleInDepthFileChange}
                      />
                    </Button>
                    
                    {inDepthFile && (
                      <FilePreview>
                        <DescriptionIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inDepthFile.name} ({(inDepthFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </Typography>
                        <Tooltip title="Remove file">
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveFile('in-depth')}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </FilePreview>
                    )}
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  fullWidth
                  size="large"
                  sx={{ py: 1.5 }}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                >
                  {loading ? 'Uploading...' : 'Submit Problem Statement'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </StyledPaper>
        
        {showTable && (
          <StyledPaper>
            <Typography variant="h6" mb={2}>
              All Problem Statements
            </Typography>
            <ProblemStatementsTable />
          </StyledPaper>
        )}
      </Grid>
    </Grid>
  );
};

export default ProblemStatementUpload;