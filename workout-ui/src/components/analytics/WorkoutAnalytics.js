// src/components/analytics/WorkoutAnalytics.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import { api } from '../../services/api';

const WorkoutAnalytics = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getUsers();
        setUsers(response.data);
      } catch (err) {
        setError('Failed to load users');
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
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [selectedUser]);

  const getWorkoutFrequencyData = () => {
    const frequencyMap = workouts.reduce((acc, workout) => {
      const date = dayjs(workout.date).format('YYYY-MM-DD');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(frequencyMap).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  };

  const getActivityDistributionData = () => {
    const activityMap = workouts.reduce((acc, workout) => {
      workout.activities.forEach(activity => {
        acc[activity.name] = (acc[activity.name] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(activityMap).map(([name, count]) => ({
      name,
      count
    }));
  };

  const getWeightProgressData = () => {
    const progressMap = new Map();
    
    workouts.forEach(workout => {
      workout.activities.forEach(activity => {
        if (activity.weight > 0) {
          const existing = progressMap.get(activity.name) || [];
          existing.push({
            date: workout.date,
            weight: activity.weight
          });
          progressMap.set(activity.name, existing);
        }
      });
    });

    return Array.from(progressMap.entries()).map(([name, data]) => ({
      name,
      data: data.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
    }));
  };

  const getWorkoutDurationData = () => {
    return workouts.map(workout => ({
      date: dayjs(workout.date).format('YYYY-MM-DD'),
      duration: workout.duration || 0
    })).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (!users.length) {
    return <Alert severity="info">No users found</Alert>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {loading ? (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" m={3}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : error ? (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          ) : (
            <>
              {/* Workout Frequency Chart */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Workout Frequency
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getWorkoutFrequencyData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Workouts" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Activity Distribution Chart */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Activity Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getActivityDistributionData()}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {getActivityDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Weight Progress Chart */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Weight Progress
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" type="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {getWeightProgressData().map((activity, index) => (
                          <Line
                            key={activity.name}
                            data={activity.data}
                            type="monotone"
                            dataKey="weight"
                            name={activity.name}
                            stroke={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Workout Duration Chart */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Workout Duration
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getWorkoutDurationData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="duration"
                          stroke="#82ca9d"
                          name="Duration (minutes)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default WorkoutAnalytics;
