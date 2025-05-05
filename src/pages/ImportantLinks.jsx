import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import LinkModal from '../components/LinkModal';
import apiInstance from "../utils/apiInstance";
import { getToken } from "../utils/tokenUtils";

const ImportantLinks = () => {
  const { user } = useSelector((state) => state.auth);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentLink, setCurrentLink] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Check if user has admin or coordinator role
  const hasEditPermission = user && (user.role === 'admin' || user.role === 'coordinator');
  
  // Auth header helper function
  const authHeader = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  // Fetch all links when component mounts
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiInstance.get('/links', authHeader());
      setLinks(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch links';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, link = null) => {
    setModalMode(mode);
    setCurrentLink(link);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentLink(null);
  };

  const handleSaveLink = async (formData, mode, id) => {
    try {
      let response;
      
      if (mode === 'add') {
        response = await apiInstance.post('/links', formData, authHeader());
      } else {
        response = await apiInstance.put(`/links/${id}`, formData, authHeader());
      }
      
      // Refresh links after successful operation
      await fetchLinks();
      showNotification(
        mode === 'add' ? 'Link added successfully' : 'Link updated successfully',
        'success'
      );
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save link';
      showNotification(errorMessage, 'error');
      throw err; // Re-throw so the modal can handle it
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await apiInstance.delete(`/links/${id}`, authHeader());
        
        // Refresh links after successful deletion
        await fetchLinks();
        showNotification('Link deleted successfully', 'success');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete link';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Important Links
        </Typography>
        
        {hasEditPermission && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal('add')}
          >
            Add New Link
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>URL</TableCell>
                {hasEditPermission && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {links.length > 0 ? (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>{link.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {link.url}
                        </Typography>
                        <IconButton size="small" onClick={() => openLink(link.url)}>
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    {hasEditPermission && (
                      <TableCell align="center">
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenModal('edit', link)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteLink(link.id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={hasEditPermission ? 3 : 2} align="center">
                    No links found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal for add/edit operations */}
      <LinkModal
        open={openModal}
        handleClose={handleCloseModal}
        link={currentLink}
        mode={modalMode}
        onSave={handleSaveLink}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImportantLinks;