// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import activityRoutes from './routes/activityRoutes';
import userRoutes from './routes/userRoutes';
import workoutRoutes from './routes/workoutRoutes';

dotenv.config();

const app = express();
// const port = process.env.PORT || 3000;
const port = process.env.PORT ;


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/activity-master-list', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.json({ description: 'Backend API Service', "api-list": [
    "/api/activity-master-list",
    "/api/users",
    "/api/workouts"
  ] });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

