"""Verification script for predict_single (Step 4)."""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from src.model.predict import predict_single

SAMPLE_INPUT = {
    "age": 72.0,
    "gender": 0,
    "bmi": 27.5,
    "hemoglobin": 11.8,
    "hematocrit": 36.0,
    "platelet_count": 210.0,
    "num_comorbidities": 3,
    "systolic_bp": 145.0,
    "creatinine": 1.6,
    "albumin": 3.3,
    "community_type": "Rural",
    "median_income": 38000.0,
    "poverty_rate": 22.0,
    "education_bachelors_pct": 18.5,
    "unemployment_rate": 12.0,
    "no_health_insurance_pct": 18.0,
    "disability_rate": 22.0,
    "no_vehicle_pct": 12.0,
    "median_housing_cost": 750.0,
}

REQUIRED_KEYS = {
    "frailty_score", "is_frail", "probability",
    "shap_values", "base_value", "top_risk_factors", "recommendations",
}

result = predict_single(SAMPLE_INPUT)

missing = REQUIRED_KEYS - set(result.keys())
assert not missing, f"Missing keys: {missing}"
assert isinstance(result["frailty_score"], int), "frailty_score must be int"
assert result["is_frail"] in (0, 1), "is_frail must be 0 or 1"
assert 0.0 <= result["probability"] <= 1.0, "probability must be in [0,1]"
assert isinstance(result["shap_values"], dict) and len(result["shap_values"]) > 0
assert isinstance(result["top_risk_factors"], list) and len(result["top_risk_factors"]) > 0
assert isinstance(result["recommendations"], list)

for rf in result["top_risk_factors"]:
    assert "feature" in rf and "shap_value" in rf and "direction" in rf
    assert rf["direction"] in ("increases_risk", "decreases_risk")

for rec in result["recommendations"]:
    assert "factor" in rec and "recommendation" in rec and "priority" in rec
    assert rec["priority"] in ("high", "medium", "low")

print("\n[VERIFY] predict_single output:")
print(f"  frailty_score:    {result['frailty_score']}")
print(f"  is_frail:         {result['is_frail']}")
print(f"  probability:      {result['probability']}")
print(f"  base_value:       {result['base_value']}")
print(f"  top_risk_factors: {result['top_risk_factors']}")
print(f"  recommendations:  {result['recommendations']}")
print(f"  shap_values keys: {list(result['shap_values'].keys())[:5]} ...")
print("\n[VERIFY] ALL ASSERTIONS PASSED")
