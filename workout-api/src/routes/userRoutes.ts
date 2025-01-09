// src/routes/userRoutes.ts
import { Router, Request, Response } from 'express';
import { userController } from '../controllers/userController';
import { workoutController } from '../controllers/workoutController';

const router = Router();

// Define the parameter interface
interface ParamsDictionary {
    id: string;
}

// Define the request body interface
interface UserRequestBody {
    name: string;
}

router.get('/', (req: Request, res: Response) => {
    userController.getAllUsers(req, res);
});

router.get('/:id', (req: Request<ParamsDictionary>, res: Response) => {
    userController.getUserById(req, res);
});

router.post('/', (req: Request<{}, {}, UserRequestBody>, res: Response) => {
    userController.createUser(req, res);
});

router.put('/:id', (req: Request<ParamsDictionary, {}, UserRequestBody>, res: Response) => {
    userController.updateUser(req, res);
});

router.delete('/:id', (req: Request<ParamsDictionary>, res: Response) => {
    userController.deleteUser(req, res);
});

router.get('/:id/workouts', (req: Request<ParamsDictionary>, res: Response) => {
    userController.getUserWorkouts(req, res);
});



export default router;
