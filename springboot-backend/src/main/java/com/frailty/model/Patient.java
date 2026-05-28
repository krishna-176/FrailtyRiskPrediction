package com.frailty.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "patients")
public class Patient {

    @Id
    private String id;
    private String userId;   // links to User.id (patient's login account)
    private String name;
    private Double age;
    private Integer gender;
    private Double bmi;
    private Double hemoglobin;
    private Double hematocrit;

    @Field(name = "plateletCount", write = Field.Write.ALWAYS)
    private Double plateletCount;

    @Field(name = "numComorbidities", write = Field.Write.ALWAYS)
    private Integer numComorbidities;

    @Field(name = "systolicBp", write = Field.Write.ALWAYS)
    private Double systolicBp;

    private Double creatinine;
    private Double albumin;

    @Field(name = "communityType", write = Field.Write.ALWAYS)
    private String communityType;

    @Field(name = "medianIncome", write = Field.Write.ALWAYS)
    private Double medianIncome;

    @Field(name = "povertyRate", write = Field.Write.ALWAYS)
    private Double povertyRate;

    @Field(name = "educationBachelorsPct", write = Field.Write.ALWAYS)
    private Double educationBachelorsPct;

    @Field(name = "unemploymentRate", write = Field.Write.ALWAYS)
    private Double unemploymentRate;

    @Field(name = "noHealthInsurancePct", write = Field.Write.ALWAYS)
    private Double noHealthInsurancePct;

    @Field(name = "disabilityRate", write = Field.Write.ALWAYS)
    private Double disabilityRate;

    @Field(name = "noVehiclePct", write = Field.Write.ALWAYS)
    private Double noVehiclePct;

    @Field(name = "medianHousingCost", write = Field.Write.ALWAYS)
    private Double medianHousingCost;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
