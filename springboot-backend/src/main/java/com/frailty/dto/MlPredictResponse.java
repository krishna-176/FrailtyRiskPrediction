package com.frailty.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
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

    @JsonProperty("ai_powered")
    private Boolean aiPowered = false;
}
