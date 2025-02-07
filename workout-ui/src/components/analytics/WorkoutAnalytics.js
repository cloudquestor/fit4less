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

  const [pushupData, setPushupData] = useState([]);
  const [monthlyPushupTotal, setMonthlyPushupTotal] = useState(0);
  const [totalRunDistance, setTotalRunDistance] = useState(0);
  const [totalWalkDistance, setTotalWalkDistance] = useState(0);


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
        setPushupData([]);
        setMonthlyPushupTotal(0);
        setTotalRunDistance(0);
        setTotalWalkDistance(0);
        return;
      }

      setLoading(true);
      try {
        const response = await api.getWorkoutsByUser(selectedUser);
        setWorkouts(response.data);
        setError(null);

        // Process pushup data
        const pushupsByDay = {};
        let totalPushups = 0;
        let runningDistance = 0;
        let walkingDistance = 0;
        
        response.data.forEach(workout => {
          workout.activities.forEach(activity => {
            if (activity.name.toLowerCase().includes('push-up')) {
              const date = dayjs(workout.date).format('YYYY-MM-DD');
              pushupsByDay[date] = (pushupsByDay[date] || 0) + (activity.sets * activity.reps);
              totalPushups += (activity.sets * activity.reps);
            }
              // Process running distance
            if (activity.name.toLowerCase().includes('running')) {
              runningDistance += activity.distance || 0;
            }
            
            // Process walking distance
            if (activity.name.toLowerCase().includes('walking')) {
              walkingDistance += activity.distance || 0;
            }

            
          });
        });

        // Convert to array format for chart
        const pushupArray = Object.entries(pushupsByDay).map(([date, count]) => ({
          date,
          count
        }));

        setPushupData(pushupArray);
        setMonthlyPushupTotal(totalPushups);
        setTotalRunDistance(runningDistance);
        setTotalWalkDistance(walkingDistance);
        setLoading(false);
      } catch (err) {
        setError('Failed to load workouts');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [selectedUser]);

  // Helper function to format distance
  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${distance.toFixed(1)}m`;
    }
    return `${(distance / 1000).toFixed(2)}km`;
  };

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

            {/* Total Running Distance Widget */}
            <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Total Running Distance
                        </Typography>
                        <Typography variant="h3" component="div" color="primary">
                          {formatDistance(totalRunDistance)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Total Walking Distance Widget */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Total Walking Distance
                        </Typography>
                        <Typography variant="h3" component="div" color="primary">
                          {formatDistance(totalWalkDistance)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

              {/* Monthly Pushup Total Widget */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Pushups This Month
                    </Typography>
                    <Typography variant="h3" component="div" color="primary">
                      {monthlyPushupTotal}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
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

              

      {/* Daily Pushup Count Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Pushup Count
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pushupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#8884d8"
                  name="Pushups"
                />
              </BarChart>
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

              
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default WorkoutAnalytics;
