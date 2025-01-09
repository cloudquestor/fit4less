// src/components/workouts/WorkoutForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  IconButton,
  Paper,
  Grid,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { api } from '../../services/api';

const WorkoutForm = ({ workout, onSubmit, onCancel }) => {
  // Update initial state to use workout prop if available
  const [workoutData, setWorkoutData] = useState({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    user_id: '',
    activities: []
  });

  // Add useEffect to handle workout prop changes
  useEffect(() => {
    if (workout) {
      setWorkoutData({
        ...workout,
        date: new Date(workout.date).toISOString().split('T')[0],
      });
    } else {
      setWorkoutData({
        name: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        user_id: '',
        activities: []
      });
    }
  }, [workout]);

  const [masterActivities, setMasterActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching data...');
        // Fetch users first
        const usersResponse = await api.getUsers();
        console.log('Users data:', usersResponse.data);
        setUsers(usersResponse.data);

        // Fetch master activities
        const activitiesResponse = await api.getMasterActivities();
        console.log('Activities data:', activitiesResponse.data);
        setMasterActivities(activitiesResponse.data);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form change:', name, value);
    setWorkoutData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addActivity = () => {
    setWorkoutData(prev => ({
      ...prev,
      activities: [...prev.activities, {
        activity_id: '',
        sets: 1,
        reps: 1,
        weight: 0,
        duration: 0,
        distance: 0
      }]
    }));
  };

  const removeActivity = (index) => {
    setWorkoutData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  const handleActivityChange = (index, field, value) => {
    setWorkoutData(prev => {
      const newActivities = [...prev.activities];
      newActivities[index] = {
        ...newActivities[index],
        [field]: value
      };
      return {
        ...prev,
        activities: newActivities
      };
    });
  };

  // Update handleSubmit to handle both create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (workout) {
        await api.updateWorkout(workout.id, workoutData);
      } else {
        await api.createWorkout(workoutData);
      }
      onSubmit();
      setSuccess(true);
    } catch (err) {
      console.error('Error saving workout:', err);
      setError('Failed to save workout');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Button 
          color="inherit" 
          size="small" 
          onClick={() => window.location.reload()}
          sx={{ ml: 2 }}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Record Workout
        </Typography>

        <Grid container spacing={2}>
          {/* User Selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Select User</InputLabel>
              <Select
                name="user_id"
                value={workoutData.user_id}
                onChange={handleChange}
                label="Select User"
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Workout Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="name"
              label="Workout Name"
              value={workoutData.name}
              onChange={handleChange}
            />
          </Grid>

          {/* Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="date"
              label="Date"
              type="date"
              value={workoutData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              multiline
              rows={2}
              value={workoutData.description}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* Activities Section */}
        <Box sx={{ mt: 3 }}>
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1">
              Activities
            </Typography>
            <IconButton color="primary" onClick={addActivity} sx={{ ml: 1 }}>
              <AddIcon />
            </IconButton>
          </Box>

          {workoutData.activities.map((activity, index) => (
            <Paper key={index} sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Activity</InputLabel>
                    <Select
                      value={activity.activity_id}
                      onChange={(e) => handleActivityChange(index, 'activity_id', e.target.value)}
                      label="Activity"
                    >
                      {masterActivities.map((act) => (
                        <MenuItem key={act.id} value={act.id}>
                          {act.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    label="Sets"
                    type="number"
                    value={activity.sets}
                    onChange={(e) => handleActivityChange(index, 'sets', parseInt(e.target.value) || 0)}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    label="Reps"
                    type="number"
                    value={activity.reps}
                    onChange={(e) => handleActivityChange(index, 'reps', parseInt(e.target.value) || 0)}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    type="number"
                    value={activity.weight}
                    onChange={(e) => handleActivityChange(index, 'weight', parseInt(e.target.value) || 0)}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <IconButton 
                    color="error" 
                    onClick={() => removeActivity(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>

        {/* Submit Button */}
        <Box sx={{ mt: 3 }}>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mr: 1 }}
        disabled={!workoutData.user_id || workoutData.activities.length === 0}
      >
        {workout ? 'Update Workout' : 'Save Workout'}
      </Button>
      {workout && (
        <Button
          variant="outlined"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
    </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Workout saved successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
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
    </Box>
  );
};

export default WorkoutForm;
