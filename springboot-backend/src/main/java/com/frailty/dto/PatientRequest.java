package com.frailty.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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

    public PatientRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getAge() { return age; }
    public void setAge(Double age) { this.age = age; }
    public Integer getGender() { return gender; }
    public void setGender(Integer gender) { this.gender = gender; }
    public Double getBmi() { return bmi; }
    public void setBmi(Double bmi) { this.bmi = bmi; }
    public Double getHemoglobin() { return hemoglobin; }
    public void setHemoglobin(Double hemoglobin) { this.hemoglobin = hemoglobin; }
    public Double getHematocrit() { return hematocrit; }
    public void setHematocrit(Double hematocrit) { this.hematocrit = hematocrit; }
    public Double getPlateletCount() { return plateletCount; }
    public void setPlateletCount(Double plateletCount) { this.plateletCount = plateletCount; }
    public Integer getNumComorbidities() { return numComorbidities; }
    public void setNumComorbidities(Integer numComorbidities) { this.numComorbidities = numComorbidities; }
    public Double getSystolicBp() { return systolicBp; }
    public void setSystolicBp(Double systolicBp) { this.systolicBp = systolicBp; }
    public Double getCreatinine() { return creatinine; }
    public void setCreatinine(Double creatinine) { this.creatinine = creatinine; }
    public Double getAlbumin() { return albumin; }
    public void setAlbumin(Double albumin) { this.albumin = albumin; }
    public String getCommunityType() { return communityType; }
    public void setCommunityType(String communityType) { this.communityType = communityType; }
    public Double getMedianIncome() { return medianIncome; }
    public void setMedianIncome(Double medianIncome) { this.medianIncome = medianIncome; }
    public Double getPovertyRate() { return povertyRate; }
    public void setPovertyRate(Double povertyRate) { this.povertyRate = povertyRate; }
    public Double getEducationBachelorsPct() { return educationBachelorsPct; }
    public void setEducationBachelorsPct(Double v) { this.educationBachelorsPct = v; }
    public Double getUnemploymentRate() { return unemploymentRate; }
    public void setUnemploymentRate(Double unemploymentRate) { this.unemploymentRate = unemploymentRate; }
    public Double getNoHealthInsurancePct() { return noHealthInsurancePct; }
    public void setNoHealthInsurancePct(Double v) { this.noHealthInsurancePct = v; }
    public Double getDisabilityRate() { return disabilityRate; }
    public void setDisabilityRate(Double disabilityRate) { this.disabilityRate = disabilityRate; }
    public Double getNoVehiclePct() { return noVehiclePct; }
    public void setNoVehiclePct(Double noVehiclePct) { this.noVehiclePct = noVehiclePct; }
    public Double getMedianHousingCost() { return medianHousingCost; }
    public void setMedianHousingCost(Double medianHousingCost) { this.medianHousingCost = medianHousingCost; }
}
