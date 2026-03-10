package com.frailty.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RiskFactorDto {
    private String feature;

    @JsonProperty("shap_value")
    private Double shapValue;

    private String direction;

    public RiskFactorDto() {}

    public RiskFactorDto(String feature, Double shapValue, String direction) {
        this.feature = feature;
        this.shapValue = shapValue;
        this.direction = direction;
    }

    public String getFeature() { return feature; }
    public void setFeature(String feature) { this.feature = feature; }
    public Double getShapValue() { return shapValue; }
    public void setShapValue(Double shapValue) { this.shapValue = shapValue; }
    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }
}
