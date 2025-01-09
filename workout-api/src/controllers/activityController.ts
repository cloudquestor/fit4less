// src/controllers/activityController.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';

interface ParamsDictionary {
    id: string;
}

interface RequestBody {
    name: string;
    description?: string;
}

export const activityController = {
    getAllActivities: async (req: Request, res: Response) => {
        try {
            const result = await pool.query('SELECT * FROM activity_master_list ORDER BY id');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getActivityById: async (req: Request<ParamsDictionary>, res: Response) => {
        const { id } = req.params;
        try {
            const result = await pool.query('SELECT * FROM activity_master_list WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Activity not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    createActivity: async (req: Request<{}, {}, RequestBody>, res: Response) => {
        const { name, description } = req.body;
        try {
            const result = await pool.query(
                'INSERT INTO activity_master_list (name, description) VALUES ($1, $2) RETURNING *',
                [name, description]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateActivity: async (req: Request<ParamsDictionary, {}, RequestBody>, res: Response) => {
        const { id } = req.params;
        const { name, description } = req.body;
        try {
            const result = await pool.query(
                'UPDATE activity_master_list SET name = $1, description = $2 WHERE id = $3 RETURNING *',
                [name, description, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Activity not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteActivity: async (req: Request<ParamsDictionary>, res: Response) => {
        const { id } = req.params;
        try {
            const result = await pool.query(
                'DELETE FROM activity_master_list WHERE id = $1 RETURNING *',
                [id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Activity not found' });
            }
            res.json({ message: 'Activity deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
