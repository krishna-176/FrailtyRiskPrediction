package com.frailty.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class PredictResponse {

    private String id;
    private String patientId;
    private Integer frailtyScore;
    private Integer isFrail;
    private Double probability;
    private Map<String, Double> shapValues;
    private Double baseValue;
    private List<RiskFactorDto> topRiskFactors;
    private List<RecommendationDto> recommendations;
    private String modelVersion;
    private LocalDateTime timestamp;

    public PredictResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public Integer getFrailtyScore() { return frailtyScore; }
    public void setFrailtyScore(Integer frailtyScore) { this.frailtyScore = frailtyScore; }
    public Integer getIsFrail() { return isFrail; }
    public void setIsFrail(Integer isFrail) { this.isFrail = isFrail; }
    public Double getProbability() { return probability; }
    public void setProbability(Double probability) { this.probability = probability; }
    public Map<String, Double> getShapValues() { return shapValues; }
    public void setShapValues(Map<String, Double> shapValues) { this.shapValues = shapValues; }
    public Double getBaseValue() { return baseValue; }
    public void setBaseValue(Double baseValue) { this.baseValue = baseValue; }
    public List<RiskFactorDto> getTopRiskFactors() { return topRiskFactors; }
    public void setTopRiskFactors(List<RiskFactorDto> topRiskFactors) { this.topRiskFactors = topRiskFactors; }
    public List<RecommendationDto> getRecommendations() { return recommendations; }
    public void setRecommendations(List<RecommendationDto> recommendations) { this.recommendations = recommendations; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
