package com.frailty.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MlPredictRequest {

    private Double age;
    private Integer gender;
    private Double bmi;
    private Double hemoglobin;
    private Double hematocrit;

    @JsonProperty("platelet_count")
    private Double plateletCount;

    @JsonProperty("num_comorbidities")
    private Integer numComorbidities;

    @JsonProperty("systolic_bp")
    private Double systolicBp;

    private Double creatinine;
    private Double albumin;

    @JsonProperty("community_type")
    private String communityType;

    @JsonProperty("median_income")
    private Double medianIncome;

    @JsonProperty("poverty_rate")
    private Double povertyRate;

    @JsonProperty("education_bachelors_pct")
    private Double educationBachelorsPct;

    @JsonProperty("unemployment_rate")
    private Double unemploymentRate;

    @JsonProperty("no_health_insurance_pct")
    private Double noHealthInsurancePct;

    @JsonProperty("disability_rate")
    private Double disabilityRate;

    @JsonProperty("no_vehicle_pct")
    private Double noVehiclePct;

    @JsonProperty("median_housing_cost")
    private Double medianHousingCost;
}
