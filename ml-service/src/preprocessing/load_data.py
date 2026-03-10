"""Load patient frailty dataset."""
import os
import pandas as pd

DATA_PATH = os.path.join(os.path.dirname(__file__), "../../data/patient_frailty_final.csv")

EXPECTED_COLUMNS = [
    "patient_id", "age", "gender", "bmi", "hemoglobin", "hematocrit",
    "platelet_count", "num_comorbidities", "systolic_bp", "creatinine", "albumin",
    "community_type", "median_income", "poverty_rate", "education_bachelors_pct",
    "unemployment_rate", "no_health_insurance_pct", "disability_rate",
    "no_vehicle_pct", "median_housing_cost", "frailty_score", "is_frail",
]


def load_patient_data(path: str = DATA_PATH) -> pd.DataFrame:
    """Load and return the patient frailty CSV as a DataFrame."""
    path = os.path.abspath(path)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at: {path}")
    df = pd.read_csv(path)
    print(f"[load_data] Loaded {len(df)} rows, {len(df.columns)} columns from {path}")

    missing_cols = [c for c in EXPECTED_COLUMNS if c not in df.columns]
    if missing_cols:
        raise ValueError(f"[load_data] Missing expected columns: {missing_cols}")

    extra_cols = [c for c in df.columns if c not in EXPECTED_COLUMNS]
    if extra_cols:
        print(f"[load_data] Warning: unexpected columns found: {extra_cols}")

    print(f"[load_data] Column validation passed ({len(EXPECTED_COLUMNS)} expected columns present)")
    return df
