package com.frailty.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PatientRequest {

    @NotBlank
    private String name;

    @NotNull @DecimalMin("50.0") @DecimalMax("90.0")
    private Double age;

    @NotNull @Min(0) @Max(1)
    private Integer gender;

    @NotNull @DecimalMin("10.0") @DecimalMax("80.0")
    private Double bmi;

    @NotNull @DecimalMin("5.0") @DecimalMax("20.0")
    private Double hemoglobin;

    @NotNull @DecimalMin("10.0") @DecimalMax("60.0")
    private Double hematocrit;

    @NotNull @DecimalMin("20.0") @DecimalMax("800.0")
    private Double plateletCount;

    @NotNull @Min(0) @Max(5)
    private Integer numComorbidities;

    @NotNull @DecimalMin("70.0") @DecimalMax("250.0")
    private Double systolicBp;

    @NotNull @DecimalMin("0.3") @DecimalMax("10.0")
    private Double creatinine;

    @NotNull @DecimalMin("1.5") @DecimalMax("6.0")
    private Double albumin;

    @NotBlank
    private String communityType;

    @NotNull @DecimalMin("0.0")
    private Double medianIncome;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double povertyRate;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double educationBachelorsPct;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double unemploymentRate;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double noHealthInsurancePct;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double disabilityRate;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double noVehiclePct;

    @NotNull @DecimalMin("0.0")
    private Double medianHousingCost;
}
