// src/types/workout.ts
export interface ParamsDictionary {
    id: string;
    workout_id?: string;
}

export interface WorkoutActivity {
    activity_id: number;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    distance?: number;
    date_time?: string;
}

export interface WorkoutRequestBody {
    name: string;
    description?: string;
    date: string;
    user_id: number;
    duration: number;
    activities?: WorkoutActivity[];
}

export interface ActivityInWorkoutBody {
    activity_id: number;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    distance?: number;
}

export interface Workout {
    id: number;
    name: string;
    description?: string;
    date: string;
    user_id: number;
    duration: number;
    activities?: WorkoutActivity[];
}
