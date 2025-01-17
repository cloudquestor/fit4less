package com.example.workoutapi.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "activity_master_list")
public class ActivityMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
}