package com.frailty.controller;

import com.frailty.dto.PredictRequest;
import com.frailty.dto.PredictResponse;
import com.frailty.service.MLClientService;
import com.frailty.service.PatientService;
import com.frailty.service.PredictionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PatientService patientService;
    private final MLClientService mlClientService;
    private final PredictionService predictionService;
    private final WebClient mlWebClient;

    public PredictionController(PatientService patientService,
                                MLClientService mlClientService,
                                PredictionService predictionService,
                                WebClient mlWebClient) {
        this.patientService = patientService;
        this.mlClientService = mlClientService;
        this.predictionService = predictionService;
        this.mlWebClient = mlWebClient;
    }

    @PostMapping("/predict")
    public Mono<PredictResponse> predict(@Valid @RequestBody PredictRequest request) {
        return patientService.findEntityById(request.getPatientId())
                .flatMap(patient -> mlClientService.predict(patient)
                        .flatMap(mlResponse -> predictionService.savePrediction(request.getPatientId(), mlResponse)))
                .map(predictionService::toResponse);
    }

    @GetMapping("/history")
    public Flux<PredictResponse> getAllHistory() {
        return predictionService.getAllPredictions();
    }

    /** Returns predictions for the patient record linked to the currently logged-in user account */
    @GetMapping("/history/me")
    public Flux<PredictResponse> getMyHistory(Authentication authentication) {
        String userId = (String) authentication.getDetails();
        return patientService.getPatientEntityByUserId(userId)
                .flatMapMany(patient -> predictionService.getPredictionsByPatientId(patient.getId()));
    }

    @GetMapping("/history/{patientId}")
    public Flux<PredictResponse> getPatientHistory(@PathVariable String patientId) {
        return predictionService.getPredictionsByPatientId(patientId);
    }

    @GetMapping("/ml-status")
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> getMlStatus() {
        return mlWebClient.get()
                .uri("/health")
                .retrieve()
                .bodyToMono(Map.class)
                .map(m -> (Map<String, Object>) m)
                .onErrorReturn(Map.of("status", "offline", "ai_enabled", false));
    }
}
