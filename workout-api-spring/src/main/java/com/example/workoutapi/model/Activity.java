package com.example.workoutapi.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Entity
@Table(name = "activity")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private ActivityMaster activityMaster;
    
    private Integer sets;
    private Integer reps;
    private Integer weight;
    private Double duration;
    private Double distance;
    
    @Column(name = "date_time")
    private LocalDateTime dateTime;

    @ManyToMany(mappedBy = "activities")
    private Set<Workout> workouts;
}