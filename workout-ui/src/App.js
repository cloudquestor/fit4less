// src/App.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import WorkoutForm from './components/workouts/WorkoutForm';
import WorkoutList from './components/workouts/WorkoutList';
import WorkoutCalendar from './components/workouts/WorkoutCalendar';
import MasterActivityList from './components/activities/MasterActivityList';
import MasterActivityForm from './components/activities/MasterActivityForm';
import WorkoutAnalytics from './components/analytics/WorkoutAnalytics';

import { api } from './services/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedMasterActivity, setSelectedMasterActivity] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tabValue, setTabValue] = useState(0);


  const handleMasterActivitySubmit = async (activityData) => {
    try {
      if (selectedMasterActivity) {
        await api.updateMasterActivity(selectedMasterActivity.id, activityData);
      } else {
        await api.createMasterActivity(activityData);
      }
      setSelectedMasterActivity(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving master activity:', error);
    }
  };

  const handleWorkoutEdit = (workout) => {
    setSelectedWorkout(workout);
    setTabValue(3); // Switch to Record Workout tab
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (userData) => {
    try {
      if (selectedUser) {
        await api.updateUser(selectedUser.id, userData);
      } else {
        await api.createUser(userData);
      }
      setSelectedUser(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4 }}>
        Workout Tracker
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Users" />
          <Tab label="Activity Types" />
          <Tab label="Workouts" />
          <Tab label="Record Workout" />
          <Tab label="Calendar" />
          <Tab label="Analytics" />

        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
      <Box sx={{ mb: 4 }}>
          <UserForm
            user={selectedUser}
            onSubmit={handleSubmit}
            onCancel={() => setSelectedUser(null)}
          />
        </Box>
        <UserList 
          onEdit={setSelectedUser} 
          refreshTrigger={refreshTrigger} 
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 4 }}>
          <MasterActivityForm
            activity={selectedMasterActivity}
            onSubmit={handleMasterActivitySubmit}
            onCancel={() => setSelectedMasterActivity(null)}
          />
        </Box>
        <MasterActivityList
          onEdit={setSelectedMasterActivity}
          refreshTrigger={refreshTrigger}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <WorkoutList 
          onEdit={handleWorkoutEdit}
          refreshTrigger={refreshTrigger}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <WorkoutForm 
          workout={selectedWorkout}
          onSubmit={() => {
            setSelectedWorkout(null);
            setRefreshTrigger(prev => prev + 1);
          }}
          onCancel={() => setSelectedWorkout(null)}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <WorkoutCalendar />
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <WorkoutAnalytics />
      </TabPanel>
    </Container>
  );
}
export default App;