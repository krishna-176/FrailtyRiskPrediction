package com.frailty.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "patients")
public class Patient {

    @Id
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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
