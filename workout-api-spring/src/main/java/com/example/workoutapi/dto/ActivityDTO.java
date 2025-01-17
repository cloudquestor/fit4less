package com.example.workoutapi.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActivityDTO {
    private Long id;
    private Long activityMasterId;
    private String activityName;
    private Integer sets;
    private Integer reps;
    private Integer weight;
    private Double duration;
    private Double distance;
    private LocalDateTime dateTime;
}