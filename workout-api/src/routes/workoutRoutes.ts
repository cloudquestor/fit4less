// src/routes/workoutRoutes.ts
import { Router, Request, Response } from 'express';
import { workoutController } from '../controllers/workoutController';

const router = Router();

// Define the parameter interface
interface ParamsDictionary {
    id: string;
    workout_id?: string;
}

// Define the activity in workout interface
interface WorkoutActivity {
    activity_id: number;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    distance?: number;
    date_time?: string;
}

// Define the request body interface
interface WorkoutRequestBody {
    name: string;
    description?: string;
    date: string;
    user_id: number;
    activities?: WorkoutActivity[];
}

// Define the activity request body
interface ActivityInWorkoutBody {
    activity_id: number;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    distance?: number;
}

router.get('/', (req: Request, res: Response) => {
    workoutController.getAllWorkouts(req, res);
});

router.get('/:id', (req: Request<ParamsDictionary>, res: Response) => {
    workoutController.getWorkoutById(req, res);
});

router.post('/', (req: Request<{}, {}, WorkoutRequestBody>, res: Response) => {
    workoutController.createWorkout(req, res);
});

router.put('/:id', (req: Request<ParamsDictionary, {}, WorkoutRequestBody>, res: Response) => {
    workoutController.updateWorkout(req, res);
});

router.delete('/:id', (req: Request<ParamsDictionary>, res: Response) => {
    workoutController.deleteWorkout(req, res);
});

router.post('/:workout_id/activities', 
    (req: Request<ParamsDictionary, {}, ActivityInWorkoutBody>, res: Response) => {
        workoutController.addActivityToWorkout(req, res);
});

// Add the new route
router.get('/user/:id', (req: Request<ParamsDictionary>, res: Response) => { 
    workoutController.getWorkoutsByUserId(req, res);
});

export default router;
