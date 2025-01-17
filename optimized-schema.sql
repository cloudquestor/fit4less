-- Optimized schema for PostgreSQL

-- Create activity_master_list table
CREATE TABLE activity_master_list (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Activity table with proper constraints
CREATE TABLE activity (
    id SERIAL PRIMARY KEY,
    activity_master_id INTEGER NOT NULL,
    sets INTEGER CHECK (sets > 0),
    reps INTEGER CHECK (reps > 0),
    weight DECIMAL(10,2),  -- More precise for weight measurements
    duration INTERVAL,     -- Better for time duration
    distance DECIMAL(10,2),-- More precise for distance measurements
    date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_master_id) REFERENCES activity_master_list(id) ON DELETE RESTRICT
);

-- Create User table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Workout table with user relationship
CREATE TABLE workout (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration INTERVAL,  -- Better for time duration
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create junction table for Workout and Activity (many-to-many relationship)
CREATE TABLE workout_activities (
    workout_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    sequence_order INTEGER NOT NULL, -- To maintain activity order in workout
    PRIMARY KEY (workout_id, activity_id),
    FOREIGN KEY (workout_id) REFERENCES workout(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE RESTRICT
);

-- Create indexes for foreign keys and commonly queried fields
CREATE INDEX idx_activity_master_id ON activity(activity_master_id);
CREATE INDEX idx_workout_user_id ON workout(user_id);
CREATE INDEX idx_workout_date ON workout(date);
CREATE INDEX idx_workout_activities_workout_id ON workout_activities(workout_id);
CREATE INDEX idx_workout_activities_activity_id ON workout_activities(activity_id);