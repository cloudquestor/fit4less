package com.example.workoutapi.controller;

import com.example.workoutapi.model.ActivityMaster;
import com.example.workoutapi.service.ActivityMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activity-master-list")
@CrossOrigin(origins = "*")
public class ActivityMasterController {
    
    @Autowired
    private ActivityMasterService activityMasterService;
    
    @GetMapping
    public List<ActivityMaster> getAllActivityMasters() {
        return activityMasterService.getAllActivityMasters();
    }
    
    @GetMapping("/{id}")
    public ActivityMaster getActivityMasterById(@PathVariable Long id) {
        return activityMasterService.getActivityMasterById(id);
    }
    
    @PostMapping
    public ActivityMaster createActivityMaster(@RequestBody ActivityMaster activityMaster) {
        return activityMasterService.createActivityMaster(activityMaster);
    }
    
    @PutMapping("/{id}")
    public ActivityMaster updateActivityMaster(@PathVariable Long id, @RequestBody ActivityMaster activityMasterDetails) {
        return activityMasterService.updateActivityMaster(id, activityMasterDetails);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActivityMaster(@PathVariable Long id) {
        activityMasterService.deleteActivityMaster(id);
        return ResponseEntity.ok().build();
    }
}