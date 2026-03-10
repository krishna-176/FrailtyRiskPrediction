"""Data cleaning: handle missing values, outlier capping, and deduplication."""
import pandas as pd
import numpy as np


COMMUNITY_TYPES = ["Urban", "Suburban", "Suburban/Small City", "Small Town", "Rural", "Frontier"]

NUMERIC_FEATURE_COLS = [
    "age", "bmi", "hemoglobin", "hematocrit", "platelet_count",
    "num_comorbidities", "systolic_bp", "creatinine", "albumin",
    "median_income", "poverty_rate", "education_bachelors_pct",
    "unemployment_rate", "no_health_insurance_pct", "disability_rate",
    "no_vehicle_pct", "median_housing_cost",
]


def handle_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Fill missing values with column median (numeric) or mode (categorical)."""
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols:
        if df[col].isna().any():
            median = df[col].median()
            df[col] = df[col].fillna(median)
            print(f"[clean_data] Filled {col} NaN with median={median:.3f}")

    if "community_type" in df.columns and df["community_type"].isna().any():
        mode_val = df["community_type"].mode()[0]
        df["community_type"] = df["community_type"].fillna(mode_val)
        print(f"[clean_data] Filled community_type NaN with mode={mode_val}")

    return df


def cap_outliers(df: pd.DataFrame, cols: list = None) -> pd.DataFrame:
    """Cap outliers using 1.5×IQR rule for specified columns (or all numeric if None)."""
    df = df.copy()
    if cols is None:
        cols = [c for c in NUMERIC_FEATURE_COLS if c in df.columns]

    for col in cols:
        if col not in df.columns:
            continue
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lo = q1 - 1.5 * iqr
        hi = q3 + 1.5 * iqr
        n_clipped = ((df[col] < lo) | (df[col] > hi)).sum()
        if n_clipped > 0:
            df[col] = df[col].clip(lo, hi)
            print(f"[clean_data] Capped {n_clipped} outliers in {col} to [{lo:.3f}, {hi:.3f}] (IQR method)")

    return df


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Remove duplicate rows and report count removed."""
    before = len(df)
    df = df.drop_duplicates()
    removed = before - len(df)
    if removed > 0:
        print(f"[clean_data] Removed {removed} duplicate rows")
    return df


def validate_community_type(df: pd.DataFrame) -> pd.DataFrame:
    """Replace invalid community_type values with 'Urban'."""
    df = df.copy()
    if "community_type" in df.columns:
        invalid = ~df["community_type"].isin(COMMUNITY_TYPES)
        if invalid.any():
            df.loc[invalid, "community_type"] = "Urban"
            print(f"[clean_data] Replaced {invalid.sum()} invalid community_type values")
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Run full cleaning pipeline: missing → outliers → validate categories → dedup."""
    df = handle_missing(df)
    df = cap_outliers(df)
    df = validate_community_type(df)
    df = remove_duplicates(df)
    print(f"[clean_data] Final shape after cleaning: {df.shape}")
    return df
