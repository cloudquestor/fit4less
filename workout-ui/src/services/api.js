import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const api = {
  getUsers: () => axios.get(`${API_URL}/users`),
  getUser: (id) => axios.get(`${API_URL}/users/${id}`),
  createUser: (data) => axios.post(`${API_URL}/users`, data),
  updateUser: (id, data) => axios.put(`${API_URL}/users/${id}`, data),
  deleteUser: (id) => axios.delete(`${API_URL}/users/${id}`),

   // Activity endpoints
  //  getActivities: () => axios.get(`${API_URL}/activities`),
  //  getActivity: (id) => axios.get(`${API_URL}/activities/${id}`),
  //  createActivity: (data) => axios.post(`${API_URL}/activities`, data),
  //  updateActivity: (id, data) => axios.put(`${API_URL}/activities/${id}`, data),
  //  deleteActivity: (id) => axios.delete(`${API_URL}/activities/${id}`),

   // Master Activity endpoints
  getMasterActivities: () => axios.get(`${API_URL}/activity-master-list`),
  getMasterActivity: (id) => axios.get(`${API_URL}/activity-master-list/${id}`),
  createMasterActivity: (data) => axios.post(`${API_URL}/activity-master-list`, data),
  updateMasterActivity: (id, data) => axios.put(`${API_URL}/activity-master-list/${id}`, data),
  deleteMasterActivity: (id) => axios.delete(`${API_URL}/activity-master-list/${id}`),


  // New workout endpoints
  getWorkoutsByUser: (userId) => axios.get(`${API_URL}/workouts/user/${userId}`),
  getWorkouts: () => axios.get(`${API_URL}/workouts`),
  getWorkout: (id) => axios.get(`${API_URL}/workouts/${id}`),
  createWorkout: (data) => axios.post(`${API_URL}/workouts`, data),
  updateWorkout: (id, data) => axios.put(`${API_URL}/workouts/${id}`, data),
  deleteWorkout: (id) => axios.delete(`${API_URL}/workouts/${id}`)
};