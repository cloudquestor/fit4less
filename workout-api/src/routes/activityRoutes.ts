// src/routes/activityRoutes.ts
import { Router, Request, Response } from 'express';
import { activityController } from '../controllers/activityController';
// In both activityRoutes.ts and activityController.ts


const router = Router();

// Define the parameter interface
interface ParamsDictionary {
    id: string;
}

// Define the request body interface
interface RequestBody {
    name: string;
    description?: string;
}

router.get('/', (req: Request, res: Response) => {
    activityController.getAllActivities(req, res);
});

router.get('/:id', (req: Request<ParamsDictionary>, res: Response) => {
    activityController.getActivityById(req, res);
});

router.post('/', (req: Request<{}, {}, RequestBody>, res: Response) => {
    activityController.createActivity(req, res);
});

router.put('/:id', (req: Request<ParamsDictionary, {}, RequestBody>, res: Response) => {
    activityController.updateActivity(req, res);
});

router.delete('/:id', (req: Request<ParamsDictionary>, res: Response) => {
    activityController.deleteActivity(req, res);
});

export default router;
