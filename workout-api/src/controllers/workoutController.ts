// src/controllers/workoutController.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { 
    ParamsDictionary, 
    WorkoutRequestBody, 
    ActivityInWorkoutBody, 
    Workout 
} from '../types/workout';

export const workoutController = {

    // Add this new method
    getWorkoutsByUserId:  async (req: Request<ParamsDictionary>, res: Response) => {
        const { id } = req.params;
        console.log("id = %d", id)
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        try {
            const query = `
                SELECT 
                    w.*,
                    json_agg(
                        json_build_object(
                            'id', a.id,
                            'activity_id', a.activity_id,
                            'sets', a.sets,
                            'reps', a.reps,
                            'weight', a.weight,
                            'duration', a.duration,
                            'distance', a.distance,
                            'date_time', a.date_time,
                            'name', aml.name
                        )
                    ) as activities
                FROM workout w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN activity a ON wa.activity_id = a.id
                LEFT JOIN activity_master_list aml ON a.activity_id = aml.id
                WHERE w.user_id = $1
                GROUP BY w.id
                ORDER BY w.date DESC`;

            const result = await pool.query(query, [userId]);

            // Handle case where no workouts are found
            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: `No workouts found for user ${userId}`
                });
            }

            // Process the results to handle null activities
            const workouts = result.rows.map(workout => ({
                ...workout,
                activities: workout.activities[0] === null ? [] : workout.activities
            }));

            res.json(workouts);
        } catch (error) {
            console.error('Error getting workouts by user ID:', error);
            res.status(500).json({
                error: 'An error occurred while retrieving the workouts'
            });
        }
    },

    // Get all workouts
    getAllWorkouts: async (req: Request, res: Response) => {
        try {
            const result = await pool.query(`
                SELECT 
                    w.*,
                    json_agg(
                        json_build_object(
                            'id', a.id,
                            'activity_id', a.activity_id,
                            'sets', a.sets,
                            'reps', a.reps,
                            'weight', a.weight,
                            'duration', a.duration,
                            'distance', a.distance,
                            'date_time', a.date_time,
                            'name', aml.name
                        )
                    ) as activities
                FROM workout w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN activity a ON wa.activity_id = a.id
                LEFT JOIN activity_master_list aml ON a.activity_id = aml.id
                GROUP BY w.id
                ORDER BY w.date DESC
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Error getting workouts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get workout by ID
    getWorkoutById: async (req: Request<ParamsDictionary>, res: Response) => {
        const { id } = req.params;
        try {
            const result = await pool.query(`
                SELECT 
                    w.*,
                    json_agg(
                        json_build_object(
                            'id', a.id,
                            'activity_id', a.activity_id,
                            'sets', a.sets,
                            'reps', a.reps,
                            'weight', a.weight,
                            'duration', a.duration,
                            'distance', a.distance,
                            'date_time', a.date_time,
                            'name', aml.name
                        )
                    ) as activities
                FROM workout w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN activity a ON wa.activity_id = a.id
                LEFT JOIN activity_master_list aml ON a.activity_id = aml.id
                WHERE w.id = $1
                GROUP BY w.id
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Workout not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error getting workout:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Create new workout
    createWorkout: async (req: Request<{}, {}, WorkoutRequestBody>, res: Response) => {
        const { name, description, date, user_id, activities } = req.body;
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create workout
            const workoutResult = await client.query(
                'INSERT INTO workout (name, description, date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, description, date, user_id]
            );

            const workout_id = workoutResult.rows[0].id;

            // Link workout to user
            await client.query(
                'INSERT INTO user_workouts (user_id, workout_id) VALUES ($1, $2)',
                [user_id, workout_id]
            );

            // Add activities if provided
            if (activities && activities.length > 0) {
                for (const activity of activities) {
                    // Create activity record
                    const activityResult = await client.query(
                        `INSERT INTO activity 
                        (activity_id, sets, reps, weight, duration, distance, date_time) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7) 
                        RETURNING *`,
                        [
                            activity.activity_id,
                            activity.sets,
                            activity.reps,
                            activity.weight,
                            activity.duration,
                            activity.distance,
                            activity.date_time || new Date()
                        ]
                    );

                    // Link activity to workout
                    await client.query(
                        'INSERT INTO workout_activities (workout_id, activity_id) VALUES ($1, $2)',
                        [workout_id, activityResult.rows[0].id]
                    );
                }
            }

            await client.query('COMMIT');

            // Fetch the complete workout with activities
            const result = await client.query(`
                SELECT 
                    w.*,
                    json_agg(
                        json_build_object(
                            'id', a.id,
                            'activity_id', a.activity_id,
                            'sets', a.sets,
                            'reps', a.reps,
                            'weight', a.weight,
                            'duration', a.duration,
                            'distance', a.distance,
                            'date_time', a.date_time,
                            'name', aml.name
                        )
                    ) as activities
                FROM workout w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN activity a ON wa.activity_id = a.id
                LEFT JOIN activity_master_list aml ON a.activity_id = aml.id
                WHERE w.id = $1
                GROUP BY w.id
            `, [workout_id]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating workout:', error);
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            client.release();
        }
    },

    // Update workout
    updateWorkout: async (req: Request<ParamsDictionary, {}, WorkoutRequestBody>, res: Response) => {
        const { id } = req.params;
        const { name, description, date, activities } = req.body;
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update workout details
            const workoutResult = await client.query(
                'UPDATE workout SET name = $1, description = $2, date = $3 WHERE id = $4 RETURNING *',
                [name, description, date, id]
            );

            if (workoutResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Workout not found' });
            }

            // Update activities if provided
            if (activities) {
                // Remove existing activities
                await client.query('DELETE FROM workout_activities WHERE workout_id = $1', [id]);

                // Add new activities
                for (const activity of activities) {
                    const activityResult = await client.query(
                        `INSERT INTO activity 
                        (activity_id, sets, reps, weight, duration, distance, date_time) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7) 
                        RETURNING *`,
                        [
                            activity.activity_id,
                            activity.sets,
                            activity.reps,
                            activity.weight,
                            activity.duration,
                            activity.distance,
                            activity.date_time || new Date()
                        ]
                    );

                    await client.query(
                        'INSERT INTO workout_activities (workout_id, activity_id) VALUES ($1, $2)',
                        [id, activityResult.rows[0].id]
                    );
                }
            }

            await client.query('COMMIT');

            // Fetch updated workout with activities
            const result = await client.query(`
                SELECT 
                    w.*,
                    json_agg(
                        json_build_object(
                            'id', a.id,
                            'activity_id', a.activity_id,
                            'sets', a.sets,
                            'reps', a.reps,
                            'weight', a.weight,
                            'duration', a.duration,
                            'distance', a.distance,
                            'date_time', a.date_time,
                            'name', aml.name
                        )
                    ) as activities
                FROM workout w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN activity a ON wa.activity_id = a.id
                LEFT JOIN activity_master_list aml ON a.activity_id = aml.id
                WHERE w.id = $1
                GROUP BY w.id
            `, [id]);

            res.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating workout:', error);
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            client.release();
        }
    },

    // Delete workout
    deleteWorkout: async (req: Request<ParamsDictionary>, res: Response) => {
        const { id } = req.params;
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Delete workout activities
            await client.query('DELETE FROM workout_activities WHERE workout_id = $1', [id]);
            
            // Delete from user_workouts
            await client.query('DELETE FROM user_workouts WHERE workout_id = $1', [id]);

            // Delete workout
            const result = await client.query(
                'DELETE FROM workout WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Workout not found' });
            }

            await client.query('COMMIT');
            res.json({ message: 'Workout deleted successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error deleting workout:', error);
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            client.release();
        }
    },

    // Add activity to workout
    addActivityToWorkout: async (req: Request<ParamsDictionary, {}, ActivityInWorkoutBody>, res: Response) => {
        const { workout_id } = req.params;
        const { activity_id, sets, reps, weight, duration, distance } = req.body;
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if workout exists
            const workoutCheck = await client.query(
                'SELECT id FROM workout WHERE id = $1',
                [workout_id]
            );

            if (workoutCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Workout not found' });
            }

            // Create activity record
            const activityResult = await client.query(
                `INSERT INTO activity 
                (activity_id, sets, reps, weight, duration, distance, date_time) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
                RETURNING *`,
                [activity_id, sets, reps, weight, duration, distance]
            );

            // Link activity to workout
            await client.query(
                'INSERT INTO workout_activities (workout_id, activity_id) VALUES ($1, $2)',
                [workout_id, activityResult.rows[0].id]
            );

            await client.query('COMMIT');

            // Fetch activity details with name
            const result = await client.query(`
                SELECT 
                    a.*,
                    aml.name as activity_name
                FROM activity a
                JOIN activity_master_list aml ON a.activity_id = aml.id
                WHERE a.id = $1
            `, [activityResult.rows[0].id]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error adding activity to workout:', error);
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            client.release();
        }
    }
};
