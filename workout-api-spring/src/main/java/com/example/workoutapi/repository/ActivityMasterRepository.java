package com.example.workoutapi.repository;

import com.example.workoutapi.model.ActivityMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityMasterRepository extends JpaRepository<ActivityMaster, Long> {
}