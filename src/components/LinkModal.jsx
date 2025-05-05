import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Box,
  CircularProgress
} from '@mui/material';

const LinkModal = ({ open, handleClose, link, mode, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (link && mode === 'edit') {
      setFormData({
        name: link.name || '',
        url: link.url || ''
      });
    } else {
      // Reset form when opening in add mode
      setFormData({
        name: '',
        url: ''
      });
    }
    setErrors({});
  }, [link, mode, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      // Make sure URL has protocol
      const urlToCheck = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToCheck);
      
      // Update URL with protocol if it was missing
      if (!url.startsWith('http')) {
        setFormData({
          ...formData,
          url: urlToCheck
        });
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        await onSave(formData, mode, link?.id);
        handleClose();
      } catch (error) {
        console.error('Error saving link:', error);
        // Error handling is done at the parent component level
      } finally {
        setLoading(false);
      }
    }
  };

  const dialogTitle = mode === 'add' ? 'Add New Link' : 'Edit Link';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            autoFocus
          />
          <TextField
            fullWidth
            margin="dense"
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleChange}
            error={!!errors.url}
            helperText={errors.url || 'Include https:// for external sites'}
            disabled={loading}
            placeholder="https://example.com"
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : mode === 'add' ? 'Add' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkModal;