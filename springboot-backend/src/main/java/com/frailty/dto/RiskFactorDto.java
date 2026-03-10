package com.frailty.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskFactorDto {

    private String feature;

    @JsonProperty("shap_value")
    private Double shapValue;

    private String direction;
}
