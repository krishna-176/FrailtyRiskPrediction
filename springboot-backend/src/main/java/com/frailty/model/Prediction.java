package com.frailty.model;

import com.frailty.dto.RecommendationDto;
import com.frailty.dto.RiskFactorDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "predictions")
public class Prediction {

    @Id
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
    private Boolean aiPowered;
}
