package com.frailty.service;

import com.frailty.dto.MlPredictResponse;
import com.frailty.dto.PredictResponse;
import com.frailty.dto.RecommendationDto;
import com.frailty.dto.RiskFactorDto;
import com.frailty.model.Prediction;
import com.frailty.repository.PredictionRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;

    public PredictionService(PredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    public Mono<Prediction> savePrediction(String patientId, MlPredictResponse mlResponse) {
        List<RiskFactorDto> riskFactors = mlResponse.getTopRiskFactors() == null
                ? List.of() : mlResponse.getTopRiskFactors();
        List<RecommendationDto> recommendations = mlResponse.getRecommendations() == null
                ? List.of() : mlResponse.getRecommendations();

        Prediction p = new Prediction();
        p.setPatientId(patientId);
        p.setFrailtyScore(mlResponse.getFrailtyScore());
        p.setIsFrail(mlResponse.getIsFrail());
        p.setProbability(mlResponse.getProbability());
        p.setShapValues(mlResponse.getShapValues());
        p.setBaseValue(mlResponse.getBaseValue());
        p.setTopRiskFactors(riskFactors);
        p.setRecommendations(recommendations);
        p.setModelVersion("1.0.0");
        p.setTimestamp(LocalDateTime.now());

        return predictionRepository.save(p);
    }

    public Flux<PredictResponse> getAllPredictions() {
        return predictionRepository.findAll().map(this::toResponse);
    }

    public Flux<PredictResponse> getPredictionsByPatientId(String patientId) {
        return predictionRepository.findByPatientId(patientId).map(this::toResponse);
    }

    public PredictResponse toResponse(Prediction p) {
        PredictResponse r = new PredictResponse();
        r.setId(p.getId());
        r.setPatientId(p.getPatientId());
        r.setFrailtyScore(p.getFrailtyScore());
        r.setIsFrail(p.getIsFrail());
        r.setProbability(p.getProbability());
        r.setShapValues(p.getShapValues());
        r.setBaseValue(p.getBaseValue());
        r.setTopRiskFactors(p.getTopRiskFactors());
        r.setRecommendations(p.getRecommendations());
        r.setModelVersion(p.getModelVersion());
        r.setTimestamp(p.getTimestamp());
        return r;
    }
}
