"""Google Gemini LLM-powered frailty intervention recommendation engine.

Acts as the secondary AI provider — used when OpenAI is unavailable (quota/rate-limit).
Mirrors the same interface as openai_engine.py so the router can call both identically.
"""
import json
import logging
import os
from typing import List

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.0-flash"   # fast + free-tier friendly

_PROMPT_TEMPLATE = """\
You are an expert geriatric care specialist analyzing a patient's frailty risk.

## Patient Profile
- Age: {age} years | Gender: {gender} | BMI: {bmi}
- Frailty Score: {frailty_score}/5 | Probability: {probability} | Status: {status}

## Clinical Values
- Hemoglobin: {hemoglobin} g/dL | Albumin: {albumin} g/dL | Creatinine: {creatinine} mg/dL
- Systolic BP: {systolic_bp} mmHg | Hematocrit: {hematocrit}% | Platelets: {platelet_count}
- Comorbidities: {num_comorbidities}

## Social Determinants of Health
- Community: {community_type} | Poverty: {poverty_rate}% | Unemployment: {unemployment_rate}%
- No Insurance: {no_health_insurance_pct}% | Disability: {disability_rate}%
- No Vehicle: {no_vehicle_pct}% | Median Income: ${median_income:,.0f}
- Housing Cost: ${median_housing_cost:,.0f}/mo | Education (BSc): {education_bachelors_pct}%

## Top AI-Identified Risk Factors (SHAP)
{risk_factors_text}

## Task
Provide 4-6 precise, actionable, evidence-based clinical and social interventions.
Rules:
- Focus on factors marked "increases risk" in the SHAP list
- Reference the patient's ACTUAL numeric values in each recommendation
- Priority must be exactly "high", "medium", or "low"

Respond ONLY with a JSON array (no markdown, no explanation):
[
  {{"factor": "feature_name", "recommendation": "specific action", "priority": "high|medium|low"}},
  ...
]
"""


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


async def get_gemini_recommendations(
    top_factors: list,
    raw_values: dict,
    frailty_score: int,
    probability: float,
    is_frail: int,
) -> List[dict]:
    """
    Generate Gemini LLM recommendations asynchronously.
    Returns empty list on any failure (triggers rule-based fallback).
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        logger.warning("GEMINI_API_KEY not set — skipping Gemini recommendations")
        return []

    prompt = _build_prompt(top_factors, raw_values, frailty_score, probability, is_frail)

    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=api_key)

        # Run the blocking SDK call in a thread pool so we don't block the event loop
        import asyncio
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=1024,
                ),
            )
        )

        text = response.text.strip()

        # Strip markdown fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()

        parsed = json.loads(text)
        if not isinstance(parsed, list):
            raise ValueError("Expected a JSON array from Gemini")

        valid = []
        for item in parsed:
            priority = str(item.get("priority", "medium")).lower()
            if priority not in ("high", "medium", "low"):
                priority = "medium"
            valid.append({
                "factor": str(item.get("factor", "unknown")),
                "recommendation": str(item.get("recommendation", "")),
                "priority": priority,
            })

        logger.info("Gemini returned %d recommendations", len(valid))
        return valid

    except Exception as exc:
        logger.error("Gemini recommendation failed: %s", exc)
        return []
