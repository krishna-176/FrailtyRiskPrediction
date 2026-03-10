package com.frailty.dto;

public class RecommendationDto {
    private String factor;
    private String recommendation;
    private String priority;

    public RecommendationDto() {}

    public RecommendationDto(String factor, String recommendation, String priority) {
        this.factor = factor;
        this.recommendation = recommendation;
        this.priority = priority;
    }

    public String getFactor() { return factor; }
    public void setFactor(String factor) { this.factor = factor; }
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
