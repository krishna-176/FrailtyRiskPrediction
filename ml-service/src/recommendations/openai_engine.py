"""OpenAI LLM-powered frailty intervention recommendation engine."""
import json
import logging
import os
from typing import List

from openai import AsyncOpenAI
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

OPENAI_MODEL = "openai/gpt-oss-20b"

_PROMPT_TEMPLATE = """You are an expert geriatric care specialist and social worker analyzing a patient's frailty risk.

## Patient Profile
- Age: {age} years
- Gender: {gender}
- BMI: {bmi}
- Frailty Score: {frailty_score}/5
- Frailty Probability: {probability}
- Status: {status}

## Clinical Values
- Hemoglobin: {hemoglobin} g/dL
- Albumin: {albumin} g/dL
- Creatinine: {creatinine} mg/dL
- Systolic BP: {systolic_bp} mmHg
- Hematocrit: {hematocrit}%
- Platelet Count: {platelet_count} 10\u00b3/\u00b5L
- Comorbidities: {num_comorbidities}

## Social Determinants of Health
- Community Type: {community_type}
- Poverty Rate: {poverty_rate}%
- Unemployment Rate: {unemployment_rate}%
- No Health Insurance: {no_health_insurance_pct}%
- Disability Rate: {disability_rate}%
- No Vehicle: {no_vehicle_pct}%
- Median Income: ${median_income:,.0f}
- Median Housing Cost: ${median_housing_cost:,.0f}/month
- Education (Bachelor's): {education_bachelors_pct}%

## Top SHAP Risk Factors (AI model explanation)
{risk_factors_text}

## Task
Based on this patient's specific data and the AI-identified top risk factors, provide 4-6 precise, actionable, evidence-based clinical and social interventions to reduce frailty risk.

Rules:
- Focus on factors with direction "increases_risk" in the SHAP list
- Tailor recommendations to the patient's ACTUAL measured values (mention specific numbers)
- Priority must be exactly "high", "medium", or "low"
- "factor" should be the feature name from the SHAP list (e.g., "albumin", "poverty_rate")
- Recommendations must be specific, not generic — reference the patient's actual values
- Output MUST be strictly valid JSON containing a "recommendations" array where each object has "factor", "recommendation", and "priority" string fields.
"""

class RecommendationSchema(BaseModel):
    factor: str = Field(description="The feature name from the SHAP list")
    recommendation: str = Field(description="Specific actionable recommendation tailored to the patient's values")
    priority: str = Field(description="Priority of the recommendation, must be 'high', 'medium', or 'low'")


class RecommendationsResponseSchema(BaseModel):
    recommendations: List[RecommendationSchema]


def _build_prompt(top_factors: list, raw: dict, frailty_score: int, probability: float, is_frail: int) -> str:
    gender_label = "Female" if raw.get("gender", 0) == 0 else "Male"
    status = "FRAIL" if is_frail else "PRE-FRAIL / AT RISK"

    risk_lines = []
    for f in top_factors:
        direction = "increases risk" if f["direction"] == "increases_risk" else "decreases risk"
        risk_lines.append(f"- {f['feature']}: SHAP={f['shap_value']:.4f} ({direction})")
    risk_factors_text = "\n".join(risk_lines) if risk_lines else "- No significant risk factors identified"

    return _PROMPT_TEMPLATE.format(
        age=raw.get("age", "N/A"),
        gender=gender_label,
        bmi=raw.get("bmi", "N/A"),
        frailty_score=frailty_score,
        probability=f"{probability:.1%}",
        status=status,
        hemoglobin=raw.get("hemoglobin", "N/A"),
        albumin=raw.get("albumin", "N/A"),
        creatinine=raw.get("creatinine", "N/A"),
        systolic_bp=raw.get("systolic_bp", "N/A"),
        hematocrit=raw.get("hematocrit", "N/A"),
        platelet_count=raw.get("platelet_count", "N/A"),
        num_comorbidities=raw.get("num_comorbidities", "N/A"),
        community_type=raw.get("community_type", "N/A"),
        poverty_rate=raw.get("poverty_rate", "N/A"),
        unemployment_rate=raw.get("unemployment_rate", "N/A"),
        no_health_insurance_pct=raw.get("no_health_insurance_pct", "N/A"),
        disability_rate=raw.get("disability_rate", "N/A"),
        no_vehicle_pct=raw.get("no_vehicle_pct", "N/A"),
        median_income=raw.get("median_income", 0),
        median_housing_cost=raw.get("median_housing_cost", 0),
        education_bachelors_pct=raw.get("education_bachelors_pct", "N/A"),
        risk_factors_text=risk_factors_text,
    )


async def get_openai_recommendations(
    top_factors: list,
    raw_values: dict,
    frailty_score: int,
    probability: float,
    is_frail: int,
) -> List[dict]:
    """
    Generate OpenAI LLM recommendations asynchronously.
    Returns empty list if GROQ_API_KEY or OPENAI_API_KEY is not set or on any error (triggers rule-based fallback).
    """
    api_key = os.getenv("GROQ_API_KEY", "").strip() or os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        logger.warning("GROQ_API_KEY not set — skipping LLM recommendations")
        return []

    prompt = _build_prompt(top_factors, raw_values, frailty_score, probability, is_frail)

    try:
        # Use Groq API base URL
        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        
        response = await client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a specialized medical AI assistant. You must respond in valid JSON format."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=1024,
        )

        content = response.choices[0].message.content
        parsed_data = json.loads(content)
        recommendations = parsed_data.get("recommendations", [])
            
        valid = []
        for item in recommendations:
            priority = str(item.get("priority", "")).lower()
            if priority not in ("high", "medium", "low"):
                priority = "medium"
            valid.append({
                "factor": str(item.get("factor", "")),
                "recommendation": str(item.get("recommendation", "")),
                "priority": priority
            })

        logger.info("OpenAI (Groq) returned %d recommendations", len(valid))
        return valid

    except Exception as exc:
        logger.error("OpenAI (Groq) recommendation failed: %s", exc)
        return []
