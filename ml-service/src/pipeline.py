"""End-to-end training pipeline entry point."""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.preprocessing.load_data import load_patient_data
from src.preprocessing.clean_data import clean_data
from src.features.engineering import (
    encode_community_type, build_feature_matrix,
    fit_scalers, apply_scalers, save_artifacts,
)
from src.model.train import train_model, split_data
from src.model.evaluate import evaluate_model
from src.explainability.shap_explainer import build_explainer, global_summary_plot


def run_pipeline():
    print("=" * 60)
    print("Frailty Risk Prediction - Training Pipeline")
    print("=" * 60)

    print("\n[1/6] Loading data...")
    df = load_patient_data()

    print("\n[2/6] Cleaning data...")
    df = clean_data(df)

    print("\n[3/6] Feature engineering...")
    df, _encoder_map = encode_community_type(df)
    X, y = build_feature_matrix(df)
    feature_columns = list(X.columns)

    X_train, X_test, y_train, y_test = split_data(X, y)
    print(f"  Train: {X_train.shape}, Test: {X_test.shape}")

    n_not_frail = (y_train == 0).sum()
    n_frail = (y_train == 1).sum()
    scale_pos_weight = round(n_not_frail / n_frail, 4)
    print(f"  scale_pos_weight: {scale_pos_weight} ({n_not_frail}/{n_frail})")

    clinical_scaler, sdoh_scaler = fit_scalers(X_train)
    X_train_scaled = apply_scalers(X_train, clinical_scaler, sdoh_scaler)
    X_test_scaled = apply_scalers(X_test, clinical_scaler, sdoh_scaler)

    save_artifacts(clinical_scaler, sdoh_scaler, feature_columns)

    print("\n[4/6] Training model (RandomizedSearchCV n_iter=50, cv=5)...")
    model, best_params = train_model(X_train_scaled, y_train, scale_pos_weight)

    print("\n[5/6] Evaluating model...")
    metrics = evaluate_model(model, X_test_scaled, y_test, feature_names=feature_columns)

    roc_auc = metrics["roc_auc"]
    if roc_auc < 0.75:
        print(f"\nWARNING: ROC-AUC {roc_auc} is below threshold 0.75")
    else:
        print(f"\n[OK] ROC-AUC: {roc_auc} (>= 0.75 target)")

    print("\n[6/6] Generating SHAP global summary plot...")
    explainer = build_explainer(model)
    sample_size = min(200, len(X_test_scaled))
    global_summary_plot(explainer, X_test_scaled.iloc[:sample_size], feature_columns)

    print("\n" + "=" * 60)
    print("Pipeline complete!")
    print(f"  Accuracy:  {metrics['accuracy']}")
    print(f"  Precision: {metrics['precision']}")
    print(f"  Recall:    {metrics['recall']}")
    print(f"  F1:        {metrics['f1_score']}")
    print(f"  ROC-AUC:   {metrics['roc_auc']}")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
