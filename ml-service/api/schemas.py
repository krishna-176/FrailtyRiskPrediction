"""Pydantic v2 schemas for the prediction API."""
from typing import Literal, List, Dict
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    age: float = Field(ge=50, le=90, description="Age in years")
    gender: int = Field(ge=0, le=1, description="0=Female, 1=Male")
    bmi: float = Field(ge=10.0, le=80.0, description="Body mass index")
    hemoglobin: float = Field(ge=5.0, le=20.0, description="Hemoglobin g/dL")
    hematocrit: float = Field(ge=10.0, le=60.0, description="Hematocrit %")
    platelet_count: float = Field(ge=20.0, le=800.0, description="Platelet count 10³/µL")
    num_comorbidities: int = Field(ge=0, le=5, description="Number of comorbidities")
    systolic_bp: float = Field(ge=70.0, le=250.0, description="Systolic blood pressure mmHg")
    creatinine: float = Field(ge=0.3, le=10.0, description="Creatinine mg/dL")
    albumin: float = Field(ge=1.5, le=6.0, description="Albumin g/dL")
    community_type: Literal["Urban", "Suburban", "Small Town", "Rural", "Frontier"]
    median_income: float = Field(ge=0, description="Median income USD")
    poverty_rate: float = Field(ge=0, le=100, description="Poverty rate %")
    education_bachelors_pct: float = Field(ge=0, le=100, description="Bachelor's degree %")
    unemployment_rate: float = Field(ge=0, le=100, description="Unemployment rate %")
    no_health_insurance_pct: float = Field(ge=0, le=100, description="Uninsured population %")
    disability_rate: float = Field(ge=0, le=100, description="Disability rate %")
    no_vehicle_pct: float = Field(ge=0, le=100, description="Households without vehicle %")
    median_housing_cost: float = Field(ge=0, description="Median housing cost USD/month")


class RiskFactor(BaseModel):
    feature: str
    shap_value: float
    direction: Literal["increases_risk", "decreases_risk"]


class Recommendation(BaseModel):
    factor: str
    recommendation: str
    priority: Literal["high", "medium", "low"]


class PredictResponse(BaseModel):
    frailty_score: int
    is_frail: int
    probability: float
    shap_values: Dict[str, float]
    base_value: float
    top_risk_factors: List[RiskFactor]
    recommendations: List[Recommendation]
