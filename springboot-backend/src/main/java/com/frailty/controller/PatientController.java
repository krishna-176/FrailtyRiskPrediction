package com.frailty.controller;

import com.frailty.dto.PatientRequest;
import com.frailty.dto.PatientResponse;
import com.frailty.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<PatientResponse> createPatient(@Valid @RequestBody PatientRequest request) {
        return patientService.createPatient(request);
    }

    @GetMapping
    public Flux<PatientResponse> getAllPatients() {
        return patientService.getAllPatients();
    }

    /** Returns the patient record linked to the currently logged-in user account */
    @GetMapping("/me")
    public Mono<PatientResponse> getMyPatientRecord(Authentication authentication) {
        String userId = (String) authentication.getDetails();
        return patientService.getPatientByUserId(userId);
    }

    @GetMapping("/{id}")
    public Mono<PatientResponse> getPatientById(@PathVariable String id) {
        return patientService.getPatientById(id);
    }

    @PutMapping("/{id}")
    public Mono<PatientResponse> updatePatient(@PathVariable String id,
                                               @Valid @RequestBody PatientRequest request) {
        return patientService.updatePatient(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deletePatient(@PathVariable String id) {
        return patientService.deletePatient(id);
    }
}
