"""Prediction router: /predict, /health, /model-info."""
import os
import logging
from fastapi import APIRouter, HTTPException, Request

from api.schemas import PredictRequest, PredictResponse, RiskFactor, Recommendation
from src.explainability.shap_explainer import build_explainer, explain_instance
from src.recommendations.engine import get_recommendations
from src.recommendations.openai_engine import get_openai_recommendations
from src.recommendations.gemini_engine import get_gemini_recommendations

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
async def health(request: Request):
    model_loaded = hasattr(request.app.state, "model") and request.app.state.model is not None
    openai_enabled = bool(os.getenv("OPENAI_API_KEY", "").strip())
    gemini_enabled = bool(os.getenv("GEMINI_API_KEY", "").strip())
    ai_enabled = openai_enabled or gemini_enabled
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "ai_enabled": ai_enabled,
        "openai_enabled": openai_enabled,
        "gemini_enabled": gemini_enabled,
    }


@router.get("/model-info")
async def model_info(request: Request):
    state = request.app.state
    if not hasattr(state, "model") or state.model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "model_type": type(state.model).__name__,
        "feature_count": len(state.feature_columns),
        "features": state.feature_columns,
        "ai_enabled": bool(os.getenv("OPENAI_API_KEY", "").strip()) or bool(os.getenv("GEMINI_API_KEY", "").strip()),
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
    top_risk_factors_raw = shap_result["top_risk_factors"]

    # ── 3-Tier AI Cascade ─────────────────────────────────────────────────
    # Tier 1: OpenAI (best quality)
    recommendations_raw = await get_openai_recommendations(
        top_factors=top_risk_factors_raw,
        raw_values=raw,
        frailty_score=frailty_score,
        probability=prob,
        is_frail=is_frail,
    )

    # Tier 2: Gemini (free fallback when OpenAI quota/rate-limited)
    if not recommendations_raw:
        logger.info("OpenAI unavailable — trying Gemini fallback")
        recommendations_raw = await get_gemini_recommendations(
            top_factors=top_risk_factors_raw,
            raw_values=raw,
            frailty_score=frailty_score,
            probability=prob,
            is_frail=is_frail,
        )

    # Tier 3: Rule-based (always works, no API needed)
    ai_powered = bool(recommendations_raw)
    if not recommendations_raw:
        logger.info("AI providers unavailable — using rule-based fallback")
        recommendations_raw = get_recommendations(top_risk_factors_raw, raw)
    # ─────────────────────────────────────────────────────────────────────

    top_risk_factors = [RiskFactor(**f) for f in top_risk_factors_raw]
    recommendations = [Recommendation(**r) for r in recommendations_raw]

    return PredictResponse(
        frailty_score=frailty_score,
        is_frail=is_frail,
        probability=round(prob, 4),
        shap_values=shap_result["shap_values"],
        base_value=shap_result["base_value"],
        top_risk_factors=top_risk_factors,
        recommendations=recommendations,
        ai_powered=ai_powered,
    )
