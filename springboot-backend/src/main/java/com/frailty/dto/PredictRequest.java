package com.frailty.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PredictRequest {

    @NotBlank
    private String patientId;
}
