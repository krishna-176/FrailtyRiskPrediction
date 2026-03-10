"""Prediction router: /predict, /health, /model-info."""
import os
from fastapi import APIRouter, HTTPException, Request

from api.schemas import PredictRequest, PredictResponse, RiskFactor, Recommendation
from src.explainability.shap_explainer import build_explainer, explain_instance
from src.recommendations.engine import get_recommendations

router = APIRouter()


@router.get("/health")
async def health(request: Request):
    model_loaded = hasattr(request.app.state, "model") and request.app.state.model is not None
    return {"status": "ok", "model_loaded": model_loaded}


@router.get("/model-info")
async def model_info(request: Request):
    state = request.app.state
    if not hasattr(state, "model") or state.model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "model_type": type(state.model).__name__,
        "feature_count": len(state.feature_columns),
        "features": state.feature_columns,
    }


@router.post("/predict", response_model=PredictResponse)
async def predict(body: PredictRequest, request: Request):
    state = request.app.state
    if not hasattr(state, "model") or state.model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    raw = body.model_dump()

    from src.features.engineering import transform_input
    X = transform_input(
        raw,
        state.clinical_scaler,
        state.sdoh_scaler,
        state.community_encoder,
        state.feature_columns,
    )

    prob = float(state.model.predict_proba(X)[0, 1])
    is_frail = int(prob >= 0.5)

    from src.model.predict import _compute_frailty_score
    frailty_score = _compute_frailty_score(raw)

    shap_result = explain_instance(state.explainer, X, state.feature_columns)

    recommendations_raw = get_recommendations(shap_result["top_risk_factors"], raw)

    top_risk_factors = [RiskFactor(**f) for f in shap_result["top_risk_factors"]]
    recommendations = [Recommendation(**r) for r in recommendations_raw]

    return PredictResponse(
        frailty_score=frailty_score,
        is_frail=is_frail,
        probability=round(prob, 4),
        shap_values=shap_result["shap_values"],
        base_value=shap_result["base_value"],
        top_risk_factors=top_risk_factors,
        recommendations=recommendations,
    )
