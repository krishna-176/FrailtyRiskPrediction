"""Inference utilities: load artifacts and predict single instance."""
import os
import joblib
import numpy as np

from src.features.engineering import load_artifacts, transform_input
from src.explainability.shap_explainer import build_explainer, explain_instance
from src.recommendations.engine import get_recommendations

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "../../artifacts")

_model = None
_clinical_scaler = None
_sdoh_scaler = None
_community_encoder = None
_feature_columns = None
_explainer = None


def load_model_artifacts():
    """Load model and all feature engineering artifacts once."""
    global _model, _clinical_scaler, _sdoh_scaler, _community_encoder, _feature_columns, _explainer

    _model = joblib.load(os.path.join(ARTIFACTS_DIR, "model.joblib"))
    _clinical_scaler, _sdoh_scaler, _community_encoder, _feature_columns = load_artifacts()
    _explainer = build_explainer(_model)
    print("[predict] Artifacts loaded successfully")


def predict_single(features_dict: dict) -> dict:
    """
    Run inference on a single patient feature dict.

    Returns:
        {
            frailty_score: int,
            is_frail: int,
            probability: float,
            shap_values: dict[str, float],
            base_value: float,
            top_risk_factors: list[dict],
            recommendations: list[dict],
        }
    """
    if _model is None:
        load_model_artifacts()

    X = transform_input(
        features_dict,
        _clinical_scaler,
        _sdoh_scaler,
        _community_encoder,
        _feature_columns,
    )

    prob = float(_model.predict_proba(X)[0, 1])
    is_frail = int(prob >= 0.5)

    frailty_score = _compute_frailty_score(features_dict)

    explanation = explain_instance(_explainer, X, _feature_columns)

    recommendations = get_recommendations(
        explanation["top_risk_factors"],
        features_dict,
    )

    return {
        "frailty_score": frailty_score,
        "is_frail": is_frail,
        "probability": round(prob, 4),
        "shap_values": explanation["shap_values"],
        "base_value": explanation["base_value"],
        "top_risk_factors": explanation["top_risk_factors"],
        "recommendations": recommendations,
    }


def _compute_frailty_score(features: dict) -> int:
    """Reproduce the rule-based frailty score for interpretability."""
    score = 0.0

    age = features.get("age", 60)
    if age > 75:
        score += 1.5
    elif age > 65:
        score += 1.0
    elif age > 55:
        score += 0.5

    hgb = features.get("hemoglobin", 13)
    if hgb < 11:
        score += 1.0
    elif hgb < 12.5:
        score += 0.5

    comorbidities = features.get("num_comorbidities", 0)
    score += min(comorbidities * 0.3, 1.5)

    albumin = features.get("albumin", 4.0)
    if albumin < 3.2:
        score += 0.5
    elif albumin < 3.5:
        score += 0.25

    creatinine = features.get("creatinine", 1.0)
    if creatinine > 2.0:
        score += 0.5
    elif creatinine > 1.5:
        score += 0.25

    ct_map = {"Frontier": 1.5, "Rural": 1.0, "Small Town": 0.5, "Suburban": 0.25, "Urban": 0.0}
    score += ct_map.get(features.get("community_type", "Urban"), 0.0)

    poverty = features.get("poverty_rate", 10)
    if poverty > 25:
        score += 0.5
    elif poverty > 15:
        score += 0.25

    return int(np.clip(round(score), 0, 5))
