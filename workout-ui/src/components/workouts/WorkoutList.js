// src/components/workouts/WorkoutList.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import { 
  Edit as EditIcon, 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon 
} from '@mui/icons-material';
import { api } from '../../services/api';

const WorkoutList = ({ onEdit }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getUsers();
        setUsers(response.data);
      } catch (err) {
        setError('Failed to load users');
        console.error('Error loading users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Load workouts when user is selected
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!selectedUser) {
        setWorkouts([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.getWorkoutsByUser(selectedUser);
        setWorkouts(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load workouts');
        console.error('Error loading workouts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [selectedUser]);

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
    setExpandedWorkout(null);
  };

  const toggleWorkoutExpand = (workoutId) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!users.length) {
    return <Alert severity="info">No users found</Alert>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select User</InputLabel>
          <Select
            value={selectedUser}
            onChange={handleUserChange}
            label="Select User"
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading ? (
          <Box display="flex" justifyContent="center" m={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : workouts.length === 0 ? (
          <Alert severity="info">
            {selectedUser ? 'No workouts found for this user' : 'Select a user to view workouts'}
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workouts.map((workout) => (
                  <React.Fragment key={workout.id}>
                    <TableRow>
                      <TableCell>{formatDate(workout.date)}</TableCell>
                      <TableCell>{workout.name}</TableCell>
                      <TableCell>{workout.description}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => onEdit(workout)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => toggleWorkoutExpand(workout.id)}>
                          {expandedWorkout === workout.id ? 
                            <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} sx={{ py: 0 }}>
                        <Collapse in={expandedWorkout === workout.id}>
                          <Box sx={{ py: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Activities
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Activity</TableCell>
                                  <TableCell>Sets</TableCell>
                                  <TableCell>Reps</TableCell>
                                  <TableCell>Weight (kg)</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {workout.activities.map((activity, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{activity.name}</TableCell>
                                    <TableCell>{activity.sets}</TableCell>
                                    <TableCell>{activity.reps}</TableCell>
                                    <TableCell>{activity.weight}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default WorkoutList;
