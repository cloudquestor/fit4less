package com.example.workoutapi.service;

import com.example.workoutapi.model.Workout;
import com.example.workoutapi.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WorkoutService {
    
    @Autowired
    private WorkoutRepository workoutRepository;
    
    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }
    
    public List<Workout> getWorkoutsByUserId(Long userId) {
        return workoutRepository.findByUserId(userId);
    }
    
    public Workout getWorkoutById(Long id) {
        return workoutRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Workout not found with id: " + id));
    }
    
    public Workout createWorkout(Workout workout) {
        return workoutRepository.save(workout);
    }
    
    public Workout updateWorkout(Long id, Workout workoutDetails) {
        Workout workout = getWorkoutById(id);
        workout.setName(workoutDetails.getName());
        workout.setDescription(workoutDetails.getDescription());
        workout.setDate(workoutDetails.getDate());
        workout.setDuration(workoutDetails.getDuration());
        workout.setUser(workoutDetails.getUser());
        workout.setActivities(workoutDetails.getActivities());
        return workoutRepository.save(workout);
    }
    
    public void deleteWorkout(Long id) {
        Workout workout = getWorkoutById(id);
        workoutRepository.delete(workout);
    }
}