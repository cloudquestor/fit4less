package com.example.workoutapi.service;

import com.example.workoutapi.model.ActivityMaster;
import com.example.workoutapi.repository.ActivityMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ActivityMasterService {
    
    @Autowired
    private ActivityMasterRepository activityMasterRepository;
    
    public List<ActivityMaster> getAllActivityMasters() {
        return activityMasterRepository.findAll();
    }
    
    public ActivityMaster getActivityMasterById(Long id) {
        return activityMasterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("ActivityMaster not found with id: " + id));
    }
    
    public ActivityMaster createActivityMaster(ActivityMaster activityMaster) {
        return activityMasterRepository.save(activityMaster);
    }
    
    public ActivityMaster updateActivityMaster(Long id, ActivityMaster activityMasterDetails) {
        ActivityMaster activityMaster = getActivityMasterById(id);
        activityMaster.setName(activityMasterDetails.getName());
        activityMaster.setDescription(activityMasterDetails.getDescription());
        return activityMasterRepository.save(activityMaster);
    }
    
    public void deleteActivityMaster(Long id) {
        ActivityMaster activityMaster = getActivityMasterById(id);
        activityMasterRepository.delete(activityMaster);
    }
}