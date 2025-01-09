// src/components/workouts/WorkoutCalendar.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Popover,
  Badge
} from '@mui/material';
import { LocalizationProvider, DateCalendar, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { api } from '../../services/api';

const WorkoutCalendar = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);

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
    setSelectedDate(dayjs());
    setAnchorEl(null);
  };

  const handleDateClick = (date) => {
    const workoutsOnDate = workouts.filter(workout => 
      dayjs(workout.date).isSame(date, 'day')
    );

    if (workoutsOnDate.length > 0) {
      setSelectedDate(date);
      setSelectedWorkouts(workoutsOnDate);
      // Use the current target of the event
      setAnchorEl(document.activeElement);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const ServerDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;

    const hasWorkout = workouts.some(workout => 
      dayjs(workout.date).isSame(day, 'day')
    );

    return (
      <Badge
        key={props.day.toString()}
        overlap="circular"
        badgeContent={hasWorkout ? "🏋️" : undefined}
      >
        <PickersDay 
          {...other} 
          outsideCurrentMonth={outsideCurrentMonth} 
          day={day}
          sx={{
            backgroundColor: hasWorkout ? 'primary.light' : 'inherit',
            '&:hover': {
              backgroundColor: hasWorkout ? 'primary.main' : 'inherit',
            },
          }}
        />
      </Badge>
    );
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
        ) : (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateClick}
              slots={{
                day: ServerDay
              }}
            />
          </LocalizationProvider>
        )}

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              Workouts on {selectedDate && selectedDate.format('MMMM D, YYYY')}
            </Typography>
            {selectedWorkouts.map((workout) => (
              <Box key={workout.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{workout.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {workout.description}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Activities:
                </Typography>
                {workout.activities.map((activity, index) => (
                  <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                    • {activity.name}: {activity.sets} sets × {activity.reps} reps
                    {activity.weight > 0 ? ` @ ${activity.weight}kg` : ''}
                  </Typography>
                ))}
              </Box>
            ))}
          </Box>
        </Popover>
      </Paper>
    </Box>
  );
};

export default WorkoutCalendar;
