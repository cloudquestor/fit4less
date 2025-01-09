-- Create activity_master_list table
CREATE TABLE activity_master_list (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create Activity table
CREATE TABLE activity (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight INTEGER,
    duration INTEGER, -- in seconds
    distance INTEGER, -- in meters
    date_time TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activity_master_list(id)
);

-- Create Workout table
CREATE TABLE workout (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE,
    user_id INTEGER -- Adding this for the relationship with User table
);

-- Create User table
CREATE TABLE users ( -- Using 'users' instead of 'user' as it's a reserved keyword in PostgreSQL
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create junction table for Workout and Activity (many-to-many relationship)
CREATE TABLE workout_activities (
    workout_id INTEGER,
    activity_id INTEGER,
    PRIMARY KEY (workout_id, activity_id),
    FOREIGN KEY (workout_id) REFERENCES workout(id),
    FOREIGN KEY (activity_id) REFERENCES activity(id)
);

-- Create junction table for User and Workout (one-to-many relationship)
CREATE TABLE user_workouts (
    user_id INTEGER,
    workout_id INTEGER,
    PRIMARY KEY (user_id, workout_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (workout_id) REFERENCES workout(id)
);

-- Add indexes for better query performance
CREATE INDEX idx_activity_activity_id ON activity(activity_id);
CREATE INDEX idx_workout_activities_workout_id ON workout_activities(workout_id);
CREATE INDEX idx_workout_activities_activity_id ON workout_activities(activity_id);
CREATE INDEX idx_user_workouts_user_id ON user_workouts(user_id);
CREATE INDEX idx_user_workouts_workout_id ON user_workouts(workout_id);
