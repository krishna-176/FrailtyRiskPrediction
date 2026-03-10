package com.frailty.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

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

    public MlPredictRequest() {}

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
