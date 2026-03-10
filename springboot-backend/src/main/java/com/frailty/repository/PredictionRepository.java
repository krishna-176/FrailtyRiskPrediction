package com.frailty.repository;

import com.frailty.model.Prediction;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface PredictionRepository extends ReactiveMongoRepository<Prediction, String> {

    Flux<Prediction> findByPatientId(String patientId);
}
