// src/components/UserList.js
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton,
  Alert, Snackbar, CircularProgress, Box 
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { api } from '../../services/api';

const UserList = ({ onEdit, refreshTrigger }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getUsers();
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  const handleDelete = async (id) => {
    try {
      await api.deleteUser(id);
      loadUsers(); // Refresh list after deletion
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again later.');
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
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)}>
                    <Delete />
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

export default UserList;
