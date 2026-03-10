package com.frailty.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PatientResponse {

    private String id;
    private String name;
    private Double age;
    private Integer gender;
    private Double bmi;
    private Double hemoglobin;
    private Double hematocrit;
    private Double plateletCount;
    private Integer numComorbidities;
    private Double systolicBp;
    private Double creatinine;
    private Double albumin;
    private String communityType;
    private Double medianIncome;
    private Double povertyRate;
    private Double educationBachelorsPct;
    private Double unemploymentRate;
    private Double noHealthInsurancePct;
    private Double disabilityRate;
    private Double noVehiclePct;
    private Double medianHousingCost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
