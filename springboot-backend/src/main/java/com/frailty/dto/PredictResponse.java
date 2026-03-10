package com.frailty.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
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
}
