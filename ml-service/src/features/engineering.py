"""Feature engineering: encode community_type, scale clinical and SDOH features."""
import json
import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import joblib

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "../../artifacts")

COMMUNITY_TYPE_ORDER = {
    "Urban": 0,
    "Suburban": 1,
    "Suburban/Small City": 1,
    "Small Town": 2,
    "Rural": 3,
    "Frontier": 4,
}

CLINICAL_FEATURES = [
    "age", "gender", "bmi", "hemoglobin", "hematocrit",
    "platelet_count", "num_comorbidities", "systolic_bp",
    "creatinine", "albumin",
]

SDOH_FEATURES = [
    "median_income", "poverty_rate", "education_bachelors_pct",
    "unemployment_rate", "no_health_insurance_pct",
    "disability_rate", "no_vehicle_pct", "median_housing_cost",
]

LABEL_COLS = ["frailty_score", "is_frail"]


def encode_community_type(df: pd.DataFrame) -> tuple:
    """Ordinal-encode community_type and save encoder map to artifacts."""
    df = df.copy()
    df["community_type"] = df["community_type"].map(COMMUNITY_TYPE_ORDER)

    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    encoder_path = os.path.join(ARTIFACTS_DIR, "community_type_encoder.json")
    with open(encoder_path, "w") as f:
        json.dump(COMMUNITY_TYPE_ORDER, f, indent=2)
    print(f"[engineering] community_type encoder saved to {encoder_path}")

    return df, COMMUNITY_TYPE_ORDER


def build_feature_matrix(df: pd.DataFrame):
    """Split df into X (features) and y (labels)."""
    feature_cols = CLINICAL_FEATURES + ["community_type"] + SDOH_FEATURES
    X = df[feature_cols].copy()
    y = df["is_frail"].copy()
    return X, y


def fit_scalers(X_train: pd.DataFrame):
    """Fit StandardScaler on clinical and MinMaxScaler on SDOH features."""
    clinical_scaler = StandardScaler()
    sdoh_scaler = MinMaxScaler()

    clinical_scaler.fit(X_train[CLINICAL_FEATURES])
    sdoh_scaler.fit(X_train[SDOH_FEATURES])
    return clinical_scaler, sdoh_scaler


def apply_scalers(X: pd.DataFrame, clinical_scaler: StandardScaler, sdoh_scaler: MinMaxScaler) -> pd.DataFrame:
    """Apply fitted scalers to a feature DataFrame."""
    X = X.copy()
    X[CLINICAL_FEATURES] = clinical_scaler.transform(X[CLINICAL_FEATURES])
    X[SDOH_FEATURES] = sdoh_scaler.transform(X[SDOH_FEATURES])
    return X


def save_artifacts(clinical_scaler, sdoh_scaler, feature_columns):
    """Persist scalers and metadata to artifacts directory."""
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    joblib.dump(clinical_scaler, os.path.join(ARTIFACTS_DIR, "clinical_scaler.joblib"))
    joblib.dump(sdoh_scaler, os.path.join(ARTIFACTS_DIR, "sdoh_scaler.joblib"))

    with open(os.path.join(ARTIFACTS_DIR, "community_type_encoder.json"), "w") as f:
        json.dump(COMMUNITY_TYPE_ORDER, f, indent=2)

    with open(os.path.join(ARTIFACTS_DIR, "feature_columns.json"), "w") as f:
        json.dump(feature_columns, f, indent=2)

    print(f"[engineering] Artifacts saved to {ARTIFACTS_DIR}")


def load_artifacts():
    """Load all feature engineering artifacts."""
    clinical_scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "clinical_scaler.joblib"))
    sdoh_scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "sdoh_scaler.joblib"))

    with open(os.path.join(ARTIFACTS_DIR, "community_type_encoder.json")) as f:
        community_encoder = json.load(f)

    with open(os.path.join(ARTIFACTS_DIR, "feature_columns.json")) as f:
        feature_columns = json.load(f)

    return clinical_scaler, sdoh_scaler, community_encoder, feature_columns


def transform_input(raw: dict, clinical_scaler, sdoh_scaler, community_encoder, feature_columns) -> pd.DataFrame:
    """Transform a single prediction request dict into a scaled feature DataFrame."""
    df = pd.DataFrame([raw])

    df["community_type"] = df["community_type"].map(community_encoder)

    df[CLINICAL_FEATURES] = clinical_scaler.transform(df[CLINICAL_FEATURES])
    df[SDOH_FEATURES] = sdoh_scaler.transform(df[SDOH_FEATURES])

    df = df.reindex(columns=feature_columns, fill_value=0)
    return df
