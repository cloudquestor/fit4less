// src/components/activities/ActivityList.js
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { api } from '../../services/api';

const ActivityList = ({ onEdit, refreshTrigger }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await api.getActivities();
      setActivities(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load activities');
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await api.deleteActivity(id);
      loadActivities();
    } catch (err) {
      setError('Failed to delete activity');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.name}</TableCell>
                <TableCell>{activity.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(activity)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(activity.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default ActivityList;
