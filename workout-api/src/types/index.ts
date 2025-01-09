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
