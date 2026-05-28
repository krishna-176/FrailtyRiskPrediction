package com.frailty.service;

import com.frailty.dto.MlPredictRequest;
import com.frailty.dto.MlPredictResponse;
import com.frailty.model.Patient;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class MLClientService {

    private final WebClient mlWebClient;

    public MLClientService(WebClient mlWebClient) {
        this.mlWebClient = mlWebClient;
    }

    public Mono<MlPredictResponse> predict(Patient patient) {
        MlPredictRequest mlRequest = new MlPredictRequest();
        mlRequest.setAge(patient.getAge());
        mlRequest.setGender(patient.getGender());
        mlRequest.setBmi(patient.getBmi());
        mlRequest.setHemoglobin(patient.getHemoglobin());
        mlRequest.setHematocrit(patient.getHematocrit());
        mlRequest.setPlateletCount(patient.getPlateletCount());
        mlRequest.setNumComorbidities(patient.getNumComorbidities());
        mlRequest.setSystolicBp(patient.getSystolicBp());
        mlRequest.setCreatinine(patient.getCreatinine());
        mlRequest.setAlbumin(patient.getAlbumin());
        mlRequest.setCommunityType(patient.getCommunityType());
        mlRequest.setMedianIncome(patient.getMedianIncome());
        mlRequest.setPovertyRate(patient.getPovertyRate());
        mlRequest.setEducationBachelorsPct(patient.getEducationBachelorsPct());
        mlRequest.setUnemploymentRate(patient.getUnemploymentRate());
        mlRequest.setNoHealthInsurancePct(patient.getNoHealthInsurancePct());
        mlRequest.setDisabilityRate(patient.getDisabilityRate());
        mlRequest.setNoVehiclePct(patient.getNoVehiclePct());
        mlRequest.setMedianHousingCost(patient.getMedianHousingCost());

        return mlWebClient.post()
                .uri("/predict")
                .bodyValue(mlRequest)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .map(body -> new RuntimeException("ML service error " + response.statusCode() + ": " + body)))
                .bodyToMono(MlPredictResponse.class);
    }
}
