package com.frailty.dto;

import java.time.LocalDateTime;

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

    public PatientResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
