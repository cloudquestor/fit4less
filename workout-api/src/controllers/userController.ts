// src/controllers/userController.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { ParamsDictionary, UserRequestBody } from '../types/user';

export const userController = {
    // Get all users with their workout counts
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const result = await pool.query(`
                SELECT 
                    u.*,
                    COUNT(DISTINCT w.id) as workout_count,
                    json_build_object(
                        'total_workouts', COUNT(DISTINCT w.id),
                        'total_activities', COUNT(DISTINCT wa.activity_id),
                        'last_workout', MAX(w.date)
                    ) as stats
                FROM public.users u
                LEFT JOIN public.user_workouts uw ON u.id = uw.user_id
                LEFT JOIN public.workout w ON uw.workout_id = w.id
                LEFT JOIN public.workout_activities wa ON w.id = wa.workout_id
                GROUP BY u.id
                ORDER BY u.id
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get user by ID with detailed statistics
    getUserById: async (req: Request<ParamsDictionary>, res: Response) => {
        const { id } = req.params;
        const client = await pool.connect();
        
        try {
            // Get user basic info
            const userResult = await client.query(`
                SELECT 
                    u.*,
                    json_build_object(
                        'total_workouts', COUNT(DISTINCT w.id),
                        'total_activities', COUNT(DISTINCT wa.activity_id),
                        'last_workout', MAX(w.date)
                    ) as stats
                FROM users u
                LEFT JOIN user_workouts uw ON u.id = uw.user_id
                LEFT JOIN workout w ON uw.workout_id = w.id
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE u.id = $1
                GROUP BY u.id
            `, [id]);

            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get recent workouts
            const recentWorkouts = await client.query(`
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
                JOIN user_workouts uw ON w.id = uw.workout_id
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN activity a ON wa.activity_id = a.id
                LEFT JOIN activity_master_list aml ON a.activity_id = aml.id
                WHERE uw.user_id = $1
                GROUP BY w.id
                ORDER BY w.date DESC
                LIMIT 5
            `, [id]);

            // Get activity statistics
            const activityStats = await client.query(`
                SELECT 
                    aml.name as activity_name,
                    COUNT(*) as total_times,
                    AVG(a.weight) as avg_weight,
                    AVG(a.reps) as avg_reps,
                    MAX(a.weight) as max_weight,
                    SUM(a.sets) as total_sets
                FROM workout w
                JOIN user_workouts uw ON w.id = uw.workout_id
                JOIN workout_activities wa ON w.id = wa.workout_id
                JOIN activity a ON wa.activity_id = a.id
                JOIN activity_master_list aml ON a.activity_id = aml.id
                WHERE uw.user_id = $1
                GROUP BY aml.id, aml.name
                ORDER BY total_times DESC
            `, [id]);

            // Combine all data
            const userData = {
                ...userResult.rows[0],
                recent_workouts: recentWorkouts.rows,
                activity_statistics: activityStats.rows
            };

            res.json(userData);
        } catch (error) {
            console.error('Error getting user details:', error);
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            client.release();
        }
    },

    // Create new user
    createUser: async (req: Request<{}, {}, UserRequestBody>, res: Response) => {
        const { name } = req.body;
        
        try {
            const result = await pool.query(
                'INSERT INTO users (name) VALUES ($1) RETURNING *',
                [name]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Update user
    updateUser: async (req: Request<ParamsDictionary, {}, UserRequestBody>, res: Response) => {
        const { id } = req.params;
        const { name } = req.body;
        
        try {
            const result = await pool.query(
                'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
                [name, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Delete user
    deleteUser: async (req: Request<ParamsDictionary>, res: Response) => {
        const { id } = req.params;
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Delete user's workout activities
            await client.query(`
                DELETE FROM workout_activities
                WHERE workout_id IN (
                    SELECT workout_id 
                    FROM user_workouts 
                    WHERE user_id = $1
                )
            `, [id]);

            // Delete user's workouts
            await client.query(`
                DELETE FROM workout
                WHERE id IN (
                    SELECT workout_id 
                    FROM user_workouts 
                    WHERE user_id = $1
                )
            `, [id]);

            // Delete user's workout associations
            await client.query(
                'DELETE FROM user_workouts WHERE user_id = $1',
                [id]
            );

            // Delete user
            const result = await client.query(
                'DELETE FROM users WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'User not found' });
            }

            await client.query('COMMIT');
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            client.release();
        }
    },

    // Get user's workouts with pagination
    getUserWorkouts: async (req: Request<ParamsDictionary>, res: Response) => {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const client = await pool.connect();
        
        try {
            // Get total count
            const countResult = await client.query(`
                SELECT COUNT(*) 
                FROM workout w
                JOIN user_workouts uw ON w.id = uw.workout_id
                WHERE uw.user_id = $1
            `, [id]);

            const total = parseInt(countResult.rows[0].count);

            // Get paginated workouts with activities
            const workouts = await client.query(`
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
                JOIN user_workouts uw ON w.id = uw.workout_id
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN activity a ON wa.activity_id = a.id
                LEFT JOIN activity_master_list aml ON a.activity_id = aml.id
                WHERE uw.user_id = $1
                GROUP BY w.id
                ORDER BY w.date DESC
                LIMIT $2 OFFSET $3
            `, [id, limit, offset]);

            const response = {
                workouts: workouts.rows,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting user workouts:', error);
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            client.release();
        }
    },

    // Get user's activity summary
    getUserActivitySummary: async (req: Request<ParamsDictionary>, res: Response) => {
        const { id } = req.params;
        const timeframe = req.query.timeframe as string || 'all'; // all, week, month, year
        
        try {
            let dateFilter = '';
            switch (timeframe) {
                case 'week':
                    dateFilter = 'AND w.date >= NOW() - INTERVAL \'1 week\'';
                    break;
                case 'month':
                    dateFilter = 'AND w.date >= NOW() - INTERVAL \'1 month\'';
                    break;
                case 'year':
                    dateFilter = 'AND w.date >= NOW() - INTERVAL \'1 year\'';
                    break;
                default:
                    dateFilter = '';
            }

            const result = await pool.query(`
                SELECT 
                    aml.name as activity_name,
                    COUNT(*) as total_times,
                    AVG(a.weight) as avg_weight,
                    AVG(a.reps) as avg_reps,
                    MAX(a.weight) as max_weight,
                    SUM(a.sets) as total_sets,
                    SUM(a.duration) as total_duration,
                    SUM(a.distance) as total_distance
                FROM workout w
                JOIN user_workouts uw ON w.id = uw.workout_id
                JOIN workout_activities wa ON w.id = wa.workout_id
                JOIN activity a ON wa.activity_id = a.id
                JOIN activity_master_list aml ON a.activity_id = aml.id
                WHERE uw.user_id = $1 ${dateFilter}
                GROUP BY aml.id, aml.name
                ORDER BY total_times DESC
            `, [id]);

            res.json(result.rows);
        } catch (error) {
            console.error('Error getting user activity summary:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
