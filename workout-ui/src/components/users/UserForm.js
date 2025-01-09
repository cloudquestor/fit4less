// src/components/UserForm.js
import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Alert,
  Snackbar 
} from '@mui/material';

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({ name: '', email: '' });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '' });
      setError(null);
    } catch (error) {
      setError('Failed to save user. Please try again.');
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          margin="normal"
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Box sx={{ mt: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ mr: 1 }}
          >
            {user ? 'Update' : 'Create'}
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
    </>
  );
};

export default UserForm;
