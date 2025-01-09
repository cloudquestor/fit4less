#!/bin/bash

# create_project_structure.sh
PROJECT_NAME="workout-api"

# Create main project directory
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Initialize npm project
npm init -y

# Install dependencies
npm install express pg dotenv cors typescript @types/express @types/node @types/pg @types/cors
npm install --save-dev ts-node nodemon @types/node

# Create directory structure
mkdir -p src/{config,controllers,routes,types}

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF

# Update package.json scripts
node -e "
const package = require('./package.json');
package.scripts = {
  'start': 'node dist/index.js',
  'dev': 'nodemon src/index.ts',
  'build': 'tsc'
};
require('fs').writeFileSync('package.json', JSON.stringify(package, null, 2));
"

# Create .env file
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=<Some_Password>
DB_NAME=workout_db
PORT=3000
EOF

# Create database configuration
cat > src/config/database.ts << 'EOF'
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
EOF

# Create types
cat > src/types/index.ts << 'EOF'
export interface Activity {
  id: number;
  activity_id: number;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  distance?: number;
  date_time: Date;
}

export interface Workout {
  id: number;
  name: string;
  description: string;
  date: Date;
  user_id: number;
}

export interface User {
  id: number;
  name: string;
}
EOF

# Create activity controller
cat > src/controllers/activityController.ts << 'EOF'
import { Request, Response } from 'express';
import { pool } from '../config/database';

export const activityController = {
  getAllActivities: async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM activity_master_list ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getActivityById: async (req: Request, res: Response) => {
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

  createActivity: async (req: Request, res: Response) => {
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

  updateActivity: async (req: Request, res: Response) => {
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

  deleteActivity: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM activity_master_list WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
EOF

# Create activity routes
cat > src/routes/activityRoutes.ts << 'EOF'
import { Router } from 'express';
import { activityController } from '../controllers/activityController';

const router = Router();

router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);
router.post('/', activityController.createActivity);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

export default router;
EOF

# Create main application file
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import activityRoutes from './routes/activityRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/activities', activityRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
EOF

# Create placeholder files for other controllers and routes
touch src/controllers/{workoutController.ts,userController.ts}
touch src/routes/{workoutRoutes.ts,userRoutes.ts}

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.log
EOF

# Make the script executable
chmod +x create_project_structure.sh

echo "Project structure created successfully!"
echo "To start the project:"
echo "1. cd $PROJECT_NAME"
echo "2. npm run dev"
