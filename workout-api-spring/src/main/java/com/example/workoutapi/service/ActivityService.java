package com.example.workoutapi.service;

import com.example.workoutapi.model.Activity;
import com.example.workoutapi.model.ActivityMaster;
import com.example.workoutapi.repository.ActivityRepository;
import com.example.workoutapi.repository.ActivityMasterRepository;
import com.example.workoutapi.dto.ActivityDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ActivityMasterRepository activityMasterRepository;
    
    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }
    
    public Activity getActivityById(Long id) {
        return activityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));
    }
    
    public Activity createActivity(ActivityDTO activityDTO) {
        Activity activity = new Activity();
        updateActivityFromDTO(activity, activityDTO);
        return activityRepository.save(activity);
    }
    
    public Activity updateActivity(Long id, ActivityDTO activityDTO) {
        Activity activity = getActivityById(id);
        updateActivityFromDTO(activity, activityDTO);
        return activityRepository.save(activity);
    }
    
    public void deleteActivity(Long id) {
        Activity activity = getActivityById(id);
        activityRepository.delete(activity);
    }
    
    private void updateActivityFromDTO(Activity activity, ActivityDTO dto) {
        ActivityMaster activityMaster = activityMasterRepository.findById(dto.getActivityMasterId())
            .orElseThrow(() -> new RuntimeException("ActivityMaster not found with id: " + dto.getActivityMasterId()));
        
        activity.setActivityMaster(activityMaster);
        activity.setSets(dto.getSets());
        activity.setReps(dto.getReps());
        activity.setWeight(dto.getWeight());
        activity.setDuration(dto.getDuration());
        activity.setDistance(dto.getDistance());
        activity.setDateTime(dto.getDateTime());
    }
}