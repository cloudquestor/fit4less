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
  IconButton
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { api } from '../../services/api';

const WorkoutCalendar = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(dayjs());

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
  };

  const handlePreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const getDaysInMonth = () => {
    const daysInMonth = currentDate.daysInMonth();
    const firstDayOfMonth = currentDate.startOf('month').day();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(currentDate.date(i));
    }

    return days;
  };

  const getWorkoutsForDate = (date) => {
    if (!date) return [];
    return workouts.filter(workout => 
      dayjs(workout.date).isSame(date, 'day')
    );
  };

  const renderCalendarCell = (date) => {
    if (!date) return <Box sx={styles.emptyCell} />;
  
    const dayWorkouts = getWorkoutsForDate(date);
    const isToday = date.isSame(dayjs(), 'day');
  
    return (
      <Box sx={{
        ...styles.cell,
        ...(isToday && styles.todayCell)
      }}
      className={isToday ? 'todayCell' : ''}
      >
        <Box sx={styles.dateNumber}>
          {date.format('D')}
        </Box>
        <Box sx={styles.workoutList}>
          {dayWorkouts.map((workout) => (
            <Box key={workout.id} sx={styles.workoutItem}>
              <Typography variant="subtitle2" sx={styles.workoutTitle}>
                {workout.name}
              </Typography>
              {workout.activities.map((activity, index) => (
                <Typography key={index} variant="caption" sx={styles.activityItem}>
                  • {activity.name}: {activity.sets}×{activity.reps}
                  {activity.weight > 0 ? ` @ ${activity.weight}kg` : ''}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  if (!users.length) {
    return <Alert severity="info">No users found</Alert>;
  }

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.calendar}>
        <Box sx={styles.header}>
          <FormControl sx={styles.userSelect}>
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

          <Box sx={styles.monthSelector}>
            <IconButton onClick={handlePreviousMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={styles.monthYear}>
              {currentDate.format('MMMM YYYY')}
            </Typography>
            <IconButton onClick={handleNextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" m={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box sx={styles.calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Box key={day} sx={styles.dayHeader}>
                {day}
              </Box>
            ))}
            {getDaysInMonth().map((date, index) => (
              <Box key={index} sx={styles.gridCell}>
                {renderCalendarCell(date)}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const styles = {

  todayCell: {
    backgroundColor: 'transparent', // Lighter background
    border: 2,
    borderColor: 'primary.main',
    '& .MuiTypography-root': {
      color: 'text.primary' // Keep text color dark for better visibility
    }
  },
  dateNumber: {
    fontWeight: 'bold',
    mb: 0.5,
    fontSize: '0.875rem',
    color: 'text.primary',
    '& .today &': {
      color: 'primary.main',
      backgroundColor: 'primary.light',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '-4px'
    }
  },
  workoutList: {
    flex: 1,
    overflow: 'auto',
    mt: 0.5,
    '& > :last-child': {
      mb: 0
    }
  },
  workoutItem: {
    mb: 1,
    p: 0.75,
    borderRadius: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)', // White background for better contrast
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    border: '1px solid',
    borderColor: 'grey.200',
    '.todayCell &': {
      backgroundColor: '#fff', // Ensure white background in today's cell
      borderColor: 'primary.light', // Highlight border for today's workouts
    }
  },
  workoutTitle: {
    fontWeight: 600,
    fontSize: '0.8125rem',
    lineHeight: 1.2,
    color: 'text.primary', // Ensure dark text
    '.todayCell &': {
      color: 'primary.dark' // Slightly different color for today's workouts
    }
  },
  activityItem: {
    display: 'block',
    ml: 1,
    color: 'text.secondary',
    fontSize: '0.75rem',
    lineHeight: 1.3,
    '.todayCell &': {
      color: 'text.secondary' // Keep activity text readable
    }
  },

  container: {
    mt: 2,
    height: 'calc(100vh - 100px)',
    display: 'flex',
    flexDirection: 'column'
  },
  calendar: {
    p: 2,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2
  },
  userSelect: {
    minWidth: 200
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center'
  },
  monthYear: {
    mx: 2,
    minWidth: 140,
    textAlign: 'center'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridTemplateRows: 'auto repeat(6, 1fr)', // First row auto for headers
    flex: 1,
    gap: 1,
    '& > *:not(:nth-of-type(-n+7))': { // Target all cells except headers
      minHeight: 120
    }
  },
  dayHeader: {
    height: 32, // Reduced height
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'text.secondary',
    borderBottom: 1,
    borderColor: 'divider',
    backgroundColor: 'grey.50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  gridCell: {
    border: 1,
    borderColor: 'divider',
    p: 1,
    position: 'relative',
    backgroundColor: '#fff'
  },
  cell: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  emptyCell: {
    height: '100%',
    backgroundColor: 'grey.50'
  },
  todayCell: {
    backgroundColor: 'primary.light',
    '& .MuiTypography-root': {
      color: 'primary.contrastText'
    }
  },
  dateNumber: {
    fontWeight: 'bold',
    mb: 0.5,
    fontSize: '0.875rem',
    color: 'text.primary'
  },
  workoutList: {
    flex: 1,
    overflow: 'auto',
    mt: 0.5
  },
  workoutItem: {
    mb: 1,
    '&:last-child': {
      mb: 0
    },
    p: 0.75,
    borderRadius: 1,
    backgroundColor: '#008080',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    border: '1px solid',
    borderColor: 'grey.200'
  },
  workoutTitle: {
    fontWeight: 600,
    fontSize: '0.8125rem',
    lineHeight: 1.2
  },
  activityItem: {
    display: 'block',
    ml: 1,
    color: 'text.secondary',
    fontSize: '0.75rem',
    lineHeight: 1.3
  }
};

export default WorkoutCalendar;
