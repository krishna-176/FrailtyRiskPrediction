"""SHAP explainability: global summary and per-instance explanations."""
import os
import numpy as np
import pandas as pd
import shap
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

PLOTS_DIR = os.path.join(os.path.dirname(__file__), "../../artifacts/plots")


def build_explainer(model):
    """Create a SHAP TreeExplainer for the trained XGBoost model."""
    explainer = shap.TreeExplainer(model)
    return explainer


def explain_instance(explainer, X_instance: pd.DataFrame, feature_names: list) -> dict:
    """
    Compute SHAP values for a single instance.

    Returns:
        {
            shap_values: {feature: shap_value},
            base_value: float,
            top_risk_factors: [{feature, shap_value, direction}] (top 5 by |shap|),
        }
    """
    shap_vals = explainer.shap_values(X_instance)
    if isinstance(shap_vals, list):
        shap_vals = shap_vals[1]

    base_value = float(explainer.expected_value)
    if isinstance(explainer.expected_value, (list, np.ndarray)):
        base_value = float(explainer.expected_value[1])

    shap_row = shap_vals[0]
    shap_dict = {name: float(val) for name, val in zip(feature_names, shap_row)}

    sorted_factors = sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)
    top_5 = [
        {
            "feature": feat,
            "shap_value": round(val, 6),
            "direction": "increases_risk" if val > 0 else "decreases_risk",
        }
        for feat, val in sorted_factors[:5]
    ]

    return {
        "shap_values": {k: round(v, 6) for k, v in shap_dict.items()},
        "base_value": round(base_value, 6),
        "top_risk_factors": top_5,
    }


def global_summary_plot(explainer, X_test: pd.DataFrame, feature_names: list):
    """Generate and save a global SHAP summary plot."""
    os.makedirs(PLOTS_DIR, exist_ok=True)

    shap_values = explainer.shap_values(X_test)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]

    shap.summary_plot(shap_values, X_test, feature_names=feature_names,
                      show=False, plot_size=(10, 8))
    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, "shap_summary.png"), dpi=100, bbox_inches="tight")
    plt.close("all")
    print("[shap] Saved shap_summary.png")
