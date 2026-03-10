"""
merge_data.py
─────────────────────────────────────────────────────────────
Merges all 14 synthetic datasets into a single clean DataFrame
and saves it as  merged_clean.csv  (no frailty columns yet).

INPUT FILES (all in SRC folder):
  NHANES clinical  : DEMO_J, BMX_J, BPX_J, CBC_J, BIOPRO_J, MCQ_J
  SDoH county-level: community_type, median_income, poverty_rate,
                     education_bachelors_pct, unemployment_rate,
                     insurance_coverage, disability_rate, housing_cost

OUTPUT:
  merged_clean.csv  — one row per patient, 20 feature columns
"""

import pandas as pd
import numpy as np

# ── CONFIGURATION ────────────────────────────────────────
SRC = "."          # folder where all input CSVs live
OUT = "."          # folder to write merged_clean.csv
SEED = 42
AGE_MIN, AGE_MAX = 50, 90   # filter to surgery-relevant ages
# ─────────────────────────────────────────────────────────

np.random.seed(SEED)


# ═══════════════════════════════════════════════════════════
# SECTION 1 — LOAD
# ═══════════════════════════════════════════════════════════
print("=" * 55)
print("  STEP 1: Loading all 14 datasets")
print("=" * 55)

demo   = pd.read_csv("DEMO_J.csv")
bmx    = pd.read_csv("BMX_J.csv")
bpx    = pd.read_csv("BPX_J.csv")
cbc    = pd.read_csv("CBC_J.csv")
biopro = pd.read_csv("BIOPRO_J.csv")
mcq    = pd.read_csv("MCQ_J.csv")
ct     = pd.read_csv("community_type.csv")
mi     = pd.read_csv("median_income.csv")
pr     = pd.read_csv("poverty_rate.csv")
eb     = pd.read_csv("education_bachelors_pct.csv")
ur     = pd.read_csv("unemployment_rate.csv")
ic     = pd.read_csv("insurance_coverage.csv")
dr     = pd.read_csv("disability_rate.csv")
hc     = pd.read_csv("housing_cost.csv")

print(f"  ✅ All 14 files loaded  ({len(demo):,} records each)")


# ═══════════════════════════════════════════════════════════
# SECTION 2 — MERGE NHANES CLINICAL FILES  (key = SEQN)
# ═══════════════════════════════════════════════════════════
print("\n" + "=" * 55)
print("  STEP 2: Merging NHANES clinical files on SEQN")
print("=" * 55)

# 2a. Demographics
clinical = demo[["SEQN", "RIDAGEYR", "RIAGENDR"]].copy()

# 2b. Body measurements — BMI
clinical = clinical.merge(
    bmx[["SEQN", "BMXBMI"]],
    on="SEQN", how="left"
)

# 2c. Blood pressure — systolic reading 1
clinical = clinical.merge(
    bpx[["SEQN", "BPXSY1"]],
    on="SEQN", how="left"
)

# 2d. Complete blood count — Hgb, Hct, Platelets
clinical = clinical.merge(
    cbc[["SEQN", "LBXHGB", "LBXHCT", "LBXPLTSI"]],
    on="SEQN", how="left"
)

# 2e. Biochemistry — Creatinine (kidney), Albumin (nutrition)
clinical = clinical.merge(
    biopro[["SEQN", "LBXSCR", "LBXSAL"]],
    on="SEQN", how="left"
)

# 2f. Comorbidities from MCQ_J
#     Count columns where value == 1 (Yes = has that condition)
disease_cols = [
    "MCQ160A",  # Arthritis
    "MCQ160B",  # Congestive heart failure
    "MCQ160C",  # Coronary heart disease
    "MCQ160D",  # Angina
    "MCQ160E",  # Heart attack
    "MCQ160F",  # Stroke
    "MCQ160G",  # Emphysema
    "MCQ160K",  # Bronchitis
    "MCQ160L",  # Liver condition
    "MCQ160M",  # Thyroid problem
    "MCQ160N",  # Weak / failing kidneys
    "MCQ160O",  # COPD
    "MCQ220",   # Cancer
    "MCQ053",   # Anemia
    "MCQ080",   # Overweight told by doctor
]
mcq_bin = mcq[["SEQN"] + disease_cols].copy()
for col in disease_cols:
    mcq_bin[col] = (mcq_bin[col] == 1).astype(int)
mcq_bin["num_comorbidities"] = mcq_bin[disease_cols].sum(axis=1).clip(0, 5)

clinical = clinical.merge(
    mcq_bin[["SEQN", "num_comorbidities"]],
    on="SEQN", how="left"
)

print(f"  Records after NHANES merge : {len(clinical):,}")

# 2g. Rename to human-readable names
clinical = clinical.rename(columns={
    "RIDAGEYR"  : "age",
    "RIAGENDR"  : "gender",        # recode below
    "BMXBMI"    : "bmi",
    "BPXSY1"    : "systolic_bp",
    "LBXHGB"    : "hemoglobin",
    "LBXHCT"    : "hematocrit",
    "LBXPLTSI"  : "platelet_count",
    "LBXSCR"    : "creatinine",
    "LBXSAL"    : "albumin",
})

# NHANES gender: 1 = Male, 2 = Female  →  0 = Female, 1 = Male
clinical["gender"] = (clinical["gender"] == 1).astype(int)

# 2h. Filter to surgery-relevant age range
clinical = clinical[
    (clinical["age"] >= AGE_MIN) & (clinical["age"] <= AGE_MAX)
].copy()
print(f"  Records after age filter   : {len(clinical):,}  (age {AGE_MIN}–{AGE_MAX})")

# 2i. Impute NaN with column median
impute_cols = [
    "bmi", "systolic_bp", "hemoglobin", "hematocrit",
    "platelet_count", "creatinine", "albumin", "num_comorbidities"
]
for col in impute_cols:
    clinical[col] = clinical[col].fillna(clinical[col].median())

# 2j. Round to realistic precision
clinical["bmi"]               = clinical["bmi"].round(2)
clinical["hemoglobin"]        = clinical["hemoglobin"].round(2)
clinical["hematocrit"]        = clinical["hematocrit"].round(2)
clinical["platelet_count"]    = clinical["platelet_count"].round(0)
clinical["systolic_bp"]       = clinical["systolic_bp"].round(0)
clinical["creatinine"]        = clinical["creatinine"].round(2)
clinical["albumin"]           = clinical["albumin"].round(2)
clinical["num_comorbidities"] = clinical["num_comorbidities"].round(0).astype(int)

print("  ✅ Clinical merge complete")


# ═══════════════════════════════════════════════════════════
# SECTION 3 — ALIGN & MERGE SDoH FILES  (row-wise)
# ═══════════════════════════════════════════════════════════
print("\n" + "=" * 55)
print("  STEP 3: Aligning SDoH county-level data")
print("=" * 55)

n = len(clinical)

def align(df, n, seed=SEED):
    """Sample df to exactly n rows (with replacement if needed)."""
    if len(df) >= n:
        return df.sample(n=n, random_state=seed).reset_index(drop=True)
    return df.sample(n=n, replace=True, random_state=seed).reset_index(drop=True)

ct_a  = align(ct,  n)
mi_a  = align(mi,  n)
pr_a  = align(pr,  n)
eb_a  = align(eb,  n)
ur_a  = align(ur,  n)
ic_a  = align(ic,  n)
dr_a  = align(dr,  n)
hc_a  = align(hc,  n)

sdoh = pd.DataFrame({
    "community_type"          : ct_a["community_type"].values,
    "median_income"           : mi_a["median_household_income"].round(0).values,
    "poverty_rate"            : pr_a["poverty_rate_pct"].values,
    "education_bachelors_pct" : eb_a["pct_bachelors_degree"].values,
    "unemployment_rate"       : ur_a["unemployment_rate_pct"].values,
    "no_health_insurance_pct" : ic_a["uninsured_pct"].values,
    "disability_rate"         : dr_a["disability_rate_pct"].values,
    "no_vehicle_pct"          : (hc_a["pct_vacant_housing"] * 0.8).round(2).values,
    "median_housing_cost"     : hc_a["median_rent"].round(0).values,
})

print(f"  ✅ SDoH alignment complete  ({len(sdoh):,} rows)")


# ═══════════════════════════════════════════════════════════
# SECTION 4 — COMBINE & SAVE
# ═══════════════════════════════════════════════════════════
print("\n" + "=" * 55)
print("  STEP 4: Combining & saving merged_clean.csv")
print("=" * 55)

df = pd.concat(
    [clinical.reset_index(drop=True), sdoh],
    axis=1
)

# Add patient_id, drop internal SEQN
df.insert(0, "patient_id",
          [f"P{str(i+1).zfill(4)}" for i in range(len(df))])
df = df.drop(columns=["SEQN"], errors="ignore")

# Final column order
final_cols = [
    "patient_id", "age", "gender", "bmi",
    "hemoglobin", "hematocrit", "platelet_count",
    "num_comorbidities", "systolic_bp", "creatinine", "albumin",
    "community_type", "median_income", "poverty_rate",
    "education_bachelors_pct", "unemployment_rate",
    "no_health_insurance_pct", "disability_rate",
    "no_vehicle_pct", "median_housing_cost",
]
df = df[final_cols]

df.to_csv("merged_clean.csv", index=False)

print(f"  ✅ Saved  →  merged_clean.csv")
print(f"  Rows    : {len(df):,}")
print(f"  Columns : {len(df.columns)}")
print(f"\n  Preview:")
print(df.head(3).to_string())
print("\n  Run  frailty_score.py  to add frailty labels.")