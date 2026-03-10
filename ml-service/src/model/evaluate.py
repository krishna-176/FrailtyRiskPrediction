"""Model evaluation: metrics and plots."""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, roc_curve,
)

PLOTS_DIR = os.path.join(os.path.dirname(__file__), "../../artifacts/plots")


def evaluate_model(model, X_test, y_test, feature_names=None) -> dict:
    """Compute metrics and save plots. Returns metrics dict."""
    os.makedirs(PLOTS_DIR, exist_ok=True)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy":  round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall":    round(recall_score(y_test, y_pred), 4),
        "f1_score":  round(f1_score(y_test, y_pred), 4),
        "roc_auc":   round(roc_auc_score(y_test, y_prob), 4),
    }

    print("[evaluate] Metrics:")
    for k, v in metrics.items():
        print(f"  {k}: {v}")

    _save_confusion_matrix(y_test, y_pred)
    _save_roc_curve(y_test, y_prob, metrics["roc_auc"])
    if feature_names is not None:
        _save_feature_importance(model, feature_names)

    return metrics


def _save_confusion_matrix(y_test, y_pred):
    cm = confusion_matrix(y_test, y_pred)
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax,
                xticklabels=["Not Frail", "Frail"],
                yticklabels=["Not Frail", "Frail"])
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix")
    fig.tight_layout()
    fig.savefig(os.path.join(PLOTS_DIR, "confusion_matrix.png"), dpi=100)
    plt.close(fig)
    print("[evaluate] Saved confusion_matrix.png")


def _save_roc_curve(y_test, y_prob, auc_score):
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC (AUC = {auc_score:.4f})")
    ax.plot([0, 1], [0, 1], color="navy", lw=1, linestyle="--")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve")
    ax.legend(loc="lower right")
    fig.tight_layout()
    fig.savefig(os.path.join(PLOTS_DIR, "roc_curve.png"), dpi=100)
    plt.close(fig)
    print("[evaluate] Saved roc_curve.png")


def _save_feature_importance(model, feature_names):
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    top_n = min(15, len(feature_names))

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(
        [feature_names[i] for i in indices[:top_n]][::-1],
        importances[indices[:top_n]][::-1],
        color="steelblue",
    )
    ax.set_xlabel("Feature Importance (Gain)")
    ax.set_title("Top Feature Importances")
    fig.tight_layout()
    fig.savefig(os.path.join(PLOTS_DIR, "feature_importance.png"), dpi=100)
    plt.close(fig)
    print("[evaluate] Saved feature_importance.png")
