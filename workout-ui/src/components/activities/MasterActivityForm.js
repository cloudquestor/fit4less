// src/components/activities/MasterActivityForm.js
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';

const MasterActivityForm = ({ activity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activity) {
      setFormData(activity);
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [activity]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Activity name is required');
      return;
    }
    try {
      await onSubmit(formData);
      setFormData({ name: '', description: '' });
      setError(null);
    } catch (err) {
      setError('Failed to save activity');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {activity ? 'Edit Master Activity' : 'Add New Activity Type'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          required
          name="name"
          label="Activity Name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={2}
        />

        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
          >
            {activity ? 'Update' : 'Create'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outlined"
          >
            Cancel
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default MasterActivityForm;
