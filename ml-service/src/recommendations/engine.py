"""Rule-based intervention recommendation engine."""
from dataclasses import dataclass
from typing import Literal, List


@dataclass
class Rule:
    feature: str
    direction: Literal["low", "high"]
    threshold: float
    priority: Literal["high", "medium", "low"]
    recommendation: str


RULES: List[Rule] = [
    Rule("hemoglobin", "low", 12.5, "high",
         "Evaluate for anemia; consider iron/B12 supplementation and CBC follow-up"),
    Rule("albumin", "low", 3.5, "high",
         "Nutritional assessment and dietitian referral for protein-calorie support"),
    Rule("creatinine", "high", 1.5, "high",
         "Nephrology referral; monitor kidney function and medication dosing"),
    Rule("num_comorbidities", "high", 2, "high",
         "Multidisciplinary care plan review with primary physician"),
    Rule("bmi", "high", 30.0, "medium",
         "Refer to nutritional counseling and weight management program"),
    Rule("systolic_bp", "high", 140.0, "medium",
         "Blood pressure management review; lifestyle modifications"),
    Rule("age", "high", 75.0, "medium",
         "Comprehensive geriatric assessment; fall prevention program"),
    Rule("community_type", "high", 2, "high",
         "Connect to telehealth services; rural health outreach programs"),
    Rule("poverty_rate", "high", 15.0, "high",
         "Connect to social assistance programs (SNAP, Medicaid, LIHEAP)"),
    Rule("no_health_insurance_pct", "high", 15.0, "high",
         "Assist with insurance enrollment (ACA marketplace, Medicaid)"),
    Rule("unemployment_rate", "high", 10.0, "medium",
         "Refer to workforce development and social services programs"),
    Rule("disability_rate", "high", 20.0, "medium",
         "Coordinate disability support services and adaptive equipment"),
    Rule("no_vehicle_pct", "high", 10.0, "medium",
         "Arrange medical transportation assistance"),
]

COMMUNITY_TYPE_ORDER = {
    "Urban": 0, "Suburban": 1, "Small Town": 2, "Rural": 3, "Frontier": 4,
}


def get_recommendations(top_factors: list, raw_values: dict) -> list:
    """
    Generate recommendations based on SHAP top risk factors and raw feature values.

    Args:
        top_factors: list of {feature, shap_value, direction} dicts
        raw_values: original (unscaled) feature values dict

    Returns:
        list of {factor, recommendation, priority} dicts
    """
    top_feature_names = {f["feature"] for f in top_factors if f["direction"] == "increases_risk"}

    recommendations = []
    seen = set()

    community_raw = raw_values.get("community_type", "Urban")
    community_encoded = COMMUNITY_TYPE_ORDER.get(community_raw, 0)
    raw_values_copy = dict(raw_values)
    raw_values_copy["community_type"] = community_encoded

    for rule in RULES:
        if rule.feature not in top_feature_names:
            continue
        val = raw_values_copy.get(rule.feature)
        if val is None:
            continue

        triggered = (
            (rule.direction == "low" and val < rule.threshold) or
            (rule.direction == "high" and val > rule.threshold)
        )
        if triggered and rule.feature not in seen:
            seen.add(rule.feature)
            recommendations.append({
                "factor": rule.feature,
                "recommendation": rule.recommendation,
                "priority": rule.priority,
            })

    recommendations.sort(key=lambda r: {"high": 0, "medium": 1, "low": 2}[r["priority"]])
    return recommendations
