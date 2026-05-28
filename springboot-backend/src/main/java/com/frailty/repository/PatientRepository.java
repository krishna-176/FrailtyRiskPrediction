package com.frailty.repository;

import com.frailty.model.Patient;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface PatientRepository extends ReactiveMongoRepository<Patient, String> {

    Mono<Patient> findByUserId(String userId);
}
