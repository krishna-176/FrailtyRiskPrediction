package com.frailty.service;

import com.frailty.dto.MlPredictRequest;
import com.frailty.dto.MlPredictResponse;
import com.frailty.dto.PredictRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class MLClientService {

    private final WebClient mlWebClient;

    public MLClientService(WebClient mlWebClient) {
        this.mlWebClient = mlWebClient;
    }

    public Mono<MlPredictResponse> predict(PredictRequest request) {
        MlPredictRequest mlRequest = new MlPredictRequest();
        mlRequest.setAge(request.getAge());
        mlRequest.setGender(request.getGender());
        mlRequest.setBmi(request.getBmi());
        mlRequest.setHemoglobin(request.getHemoglobin());
        mlRequest.setHematocrit(request.getHematocrit());
        mlRequest.setPlateletCount(request.getPlateletCount());
        mlRequest.setNumComorbidities(request.getNumComorbidities());
        mlRequest.setSystolicBp(request.getSystolicBp());
        mlRequest.setCreatinine(request.getCreatinine());
        mlRequest.setAlbumin(request.getAlbumin());
        mlRequest.setCommunityType(request.getCommunityType());
        mlRequest.setMedianIncome(request.getMedianIncome());
        mlRequest.setPovertyRate(request.getPovertyRate());
        mlRequest.setEducationBachelorsPct(request.getEducationBachelorsPct());
        mlRequest.setUnemploymentRate(request.getUnemploymentRate());
        mlRequest.setNoHealthInsurancePct(request.getNoHealthInsurancePct());
        mlRequest.setDisabilityRate(request.getDisabilityRate());
        mlRequest.setNoVehiclePct(request.getNoVehiclePct());
        mlRequest.setMedianHousingCost(request.getMedianHousingCost());

        return mlWebClient.post()
                .uri("/predict")
                .bodyValue(mlRequest)
                .retrieve()
                .bodyToMono(MlPredictResponse.class);
    }
}
