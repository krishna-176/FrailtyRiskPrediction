package com.frailty.controller;

import com.frailty.dto.PredictRequest;
import com.frailty.dto.PredictResponse;
import com.frailty.service.MLClientService;
import com.frailty.service.PatientService;
import com.frailty.service.PredictionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PatientService patientService;
    private final MLClientService mlClientService;
    private final PredictionService predictionService;

    public PredictionController(PatientService patientService,
                                MLClientService mlClientService,
                                PredictionService predictionService) {
        this.patientService = patientService;
        this.mlClientService = mlClientService;
        this.predictionService = predictionService;
    }

    @PostMapping("/predict")
    public Mono<PredictResponse> predict(@Valid @RequestBody PredictRequest request) {
        return patientService.findEntityById(request.getPatientId())
                .flatMap(patient -> mlClientService.predict(request))
                .flatMap(mlResponse -> predictionService.savePrediction(request.getPatientId(), mlResponse))
                .map(predictionService::toResponse);
    }

    @GetMapping("/history")
    public Flux<PredictResponse> getAllHistory() {
        return predictionService.getAllPredictions();
    }

    @GetMapping("/history/{patientId}")
    public Flux<PredictResponse> getPatientHistory(@PathVariable String patientId) {
        return predictionService.getPredictionsByPatientId(patientId);
    }
}
