package com.frailty.service;

import com.frailty.dto.PatientRequest;
import com.frailty.dto.PatientResponse;
import com.frailty.model.Patient;
import com.frailty.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Mono<PatientResponse> createPatient(PatientRequest request) {
        return patientRepository.save(toEntity(request)).map(this::toResponse);
    }

    public Flux<PatientResponse> getAllPatients() {
        return patientRepository.findAll().map(this::toResponse);
    }

    public Mono<PatientResponse> getPatientById(String id) {
        return patientRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found: " + id)))
                .map(this::toResponse);
    }

    public Mono<PatientResponse> updatePatient(String id, PatientRequest request) {
        return patientRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found: " + id)))
                .flatMap(existing -> {
                    Patient updated = toEntity(request);
                    updated.setId(existing.getId());
                    updated.setCreatedAt(existing.getCreatedAt());
                    return patientRepository.save(updated);
                })
                .map(this::toResponse);
    }

    public Mono<Void> deletePatient(String id) {
        return patientRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found: " + id)))
                .flatMap(patientRepository::delete);
    }

    public Mono<Patient> findEntityById(String id) {
        return patientRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found: " + id)));
    }

    private Patient toEntity(PatientRequest req) {
        Patient p = new Patient();
        p.setName(req.getName());
        p.setAge(req.getAge());
        p.setGender(req.getGender());
        p.setBmi(req.getBmi());
        p.setHemoglobin(req.getHemoglobin());
        p.setHematocrit(req.getHematocrit());
        p.setPlateletCount(req.getPlateletCount());
        p.setNumComorbidities(req.getNumComorbidities());
        p.setSystolicBp(req.getSystolicBp());
        p.setCreatinine(req.getCreatinine());
        p.setAlbumin(req.getAlbumin());
        p.setCommunityType(req.getCommunityType());
        p.setMedianIncome(req.getMedianIncome());
        p.setPovertyRate(req.getPovertyRate());
        p.setEducationBachelorsPct(req.getEducationBachelorsPct());
        p.setUnemploymentRate(req.getUnemploymentRate());
        p.setNoHealthInsurancePct(req.getNoHealthInsurancePct());
        p.setDisabilityRate(req.getDisabilityRate());
        p.setNoVehiclePct(req.getNoVehiclePct());
        p.setMedianHousingCost(req.getMedianHousingCost());
        return p;
    }

    private PatientResponse toResponse(Patient p) {
        PatientResponse r = new PatientResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setAge(p.getAge());
        r.setGender(p.getGender());
        r.setBmi(p.getBmi());
        r.setHemoglobin(p.getHemoglobin());
        r.setHematocrit(p.getHematocrit());
        r.setPlateletCount(p.getPlateletCount());
        r.setNumComorbidities(p.getNumComorbidities());
        r.setSystolicBp(p.getSystolicBp());
        r.setCreatinine(p.getCreatinine());
        r.setAlbumin(p.getAlbumin());
        r.setCommunityType(p.getCommunityType());
        r.setMedianIncome(p.getMedianIncome());
        r.setPovertyRate(p.getPovertyRate());
        r.setEducationBachelorsPct(p.getEducationBachelorsPct());
        r.setUnemploymentRate(p.getUnemploymentRate());
        r.setNoHealthInsurancePct(p.getNoHealthInsurancePct());
        r.setDisabilityRate(p.getDisabilityRate());
        r.setNoVehiclePct(p.getNoVehiclePct());
        r.setMedianHousingCost(p.getMedianHousingCost());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        return r;
    }
}
