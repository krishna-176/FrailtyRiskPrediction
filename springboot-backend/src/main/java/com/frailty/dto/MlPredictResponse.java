package com.frailty.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class MlPredictResponse {

    @JsonProperty("frailty_score")
    private Integer frailtyScore;

    @JsonProperty("is_frail")
    private Integer isFrail;

    private Double probability;

    @JsonProperty("shap_values")
    private Map<String, Double> shapValues;

    @JsonProperty("base_value")
    private Double baseValue;

    @JsonProperty("top_risk_factors")
    private List<RiskFactorDto> topRiskFactors;

    private List<RecommendationDto> recommendations;

    public MlPredictResponse() {}

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
}
