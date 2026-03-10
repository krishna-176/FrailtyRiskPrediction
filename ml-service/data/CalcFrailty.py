"""
frailty_score.py
─────────────────────────────────────────────────────────────
Reads  merged_clean.csv  (output of merge_data.py) and
computes the Fried-style frailty score for each patient.

FRAILTY SCORING LOGIC
─────────────────────
Each factor adds points to a raw score (0 – 5 scale):

  Clinical factors
  ├── Age          > 75  → +1.5 pts
  │                > 65  → +1.0 pts
  │                > 55  → +0.5 pts
  ├── Hemoglobin   < 11  → +1.0 pts
  │                < 12.5→ +0.5 pts
  ├── Comorbidities       × 0.3 pts each (max +1.5)
  ├── Albumin      < 3.2 → +0.5 pts  (malnutrition)
  │                < 3.5 → +0.25 pts
  └── Creatinine   > 2.0 → +0.5 pts  (kidney dysfunction)
                   > 1.5 → +0.25 pts

  Social Determinants (community_type)
  ├── Frontier     → +1.5 pts
  ├── Rural        → +1.0 pts
  ├── Small Town   → +0.5 pts
  ├── Suburban     → +0.25 pts
  └── Urban        → +0.0 pts

  Poverty bonus
  ├── > 25 %       → +0.5 pts
  └── > 15 %       → +0.25 pts

  Noise            N(0, 0.4)   (realistic variation)

Final score is clipped to [0, 5] then rounded to integer.
is_frail = 1 if frailty_score >= 3, else 0.

INPUT : merged_clean.csv
OUTPUT: patient_frailty_final.csv
"""

import pandas as pd
import numpy as np

# ── CONFIGURATION ────────────────────────────────────────
SRC  = "."                  # folder containing merged_clean.csv
OUT  = "."                  # folder to write output
SEED = 42
# ─────────────────────────────────────────────────────────

np.random.seed(SEED)


# ═══════════════════════════════════════════════════════════
# SECTION 1 — LOAD
# ═══════════════════════════════════════════════════════════
print("=" * 55)
print("  STEP 1: Loading merged_clean.csv")
print("=" * 55)

df = pd.read_csv(f"{SRC}/merged_clean.csv")
print(f"  ✅ Loaded  {len(df):,} patients, {len(df.columns)} columns")


# ═══════════════════════════════════════════════════════════
# SECTION 2 — COMMUNITY TYPE → NUMERIC MAPPING
# ═══════════════════════════════════════════════════════════
COMMUNITY_SCORE = {
    "Urban"      : 0.00,
    "Suburban"   : 0.25,
    "Small Town" : 0.50,
    "Rural"      : 1.00,
    "Frontier"   : 1.50,
}


# ═══════════════════════════════════════════════════════════
# SECTION 3 — FRAILTY SCORING FUNCTION
# ═══════════════════════════════════════════════════════════

def compute_frailty_score(row: pd.Series, rng: np.random.Generator) -> int:
    """
    Compute the Fried-style frailty score for one patient.
    Returns an integer 0–5.
    """
    score = 0.0

    # ── Clinical: Age ────────────────────────────────────
    if row["age"] > 75:
        score += 1.5
    elif row["age"] > 65:
        score += 1.0
    elif row["age"] > 55:
        score += 0.5

    # ── Clinical: Hemoglobin (anaemia / weakness) ────────
    if row["hemoglobin"] < 11.0:
        score += 1.0
    elif row["hemoglobin"] < 12.5:
        score += 0.5

    # ── Clinical: Comorbidities ──────────────────────────
    score += row["num_comorbidities"] * 0.3

    # ── Clinical: Albumin (nutrition status) ─────────────
    if row["albumin"] < 3.2:
        score += 0.5
    elif row["albumin"] < 3.5:
        score += 0.25

    # ── Clinical: Creatinine (kidney function) ───────────
    if row["creatinine"] > 2.0:
        score += 0.5
    elif row["creatinine"] > 1.5:
        score += 0.25

    # ── SDoH: Community type ─────────────────────────────
    score += COMMUNITY_SCORE.get(row["community_type"], 0.5)

    # ── SDoH: Poverty rate ───────────────────────────────
    if row["poverty_rate"] > 25:
        score += 0.5
    elif row["poverty_rate"] > 15:
        score += 0.25

    # ── Gaussian noise (realistic variation) ─────────────
    score += rng.normal(0, 0.4)

    # ── Clip and round ────────────────────────────────────
    return int(np.round(np.clip(score, 0, 5)))


# ═══════════════════════════════════════════════════════════
# SECTION 4 — APPLY TO ALL PATIENTS
# ═══════════════════════════════════════════════════════════
print("\n" + "=" * 55)
print("  STEP 2: Computing frailty scores")
print("=" * 55)

rng = np.random.default_rng(SEED)

df["frailty_score"] = df.apply(
    lambda row: compute_frailty_score(row, rng),
    axis=1
)

# Binary label: 0 = Not Frail (0-2), 1 = Frail (3-5)
df["is_frail"] = (df["frailty_score"] >= 3).astype(int)

print(f"  ✅ Scores computed")


# ═══════════════════════════════════════════════════════════
# SECTION 5 — SAVE
# ═══════════════════════════════════════════════════════════
print("\n" + "=" * 55)
print("  STEP 3: Saving patient_frailty_final.csv")
print("=" * 55)

df.to_csv(f"{OUT}/patient_frailty_final.csv", index=False)
print(f"  ✅ Saved  →  patient_frailty_final.csv")


# ═══════════════════════════════════════════════════════════
# SECTION 6 — SUMMARY REPORT
# ═══════════════════════════════════════════════════════════
total   = len(df)
n_frail = df["is_frail"].sum()
n_safe  = total - n_frail

print("\n" + "=" * 55)
print("  SUMMARY REPORT")
print("=" * 55)
print(f"  Total patients   : {total:,}")
print(f"  ✅ Not Frail (0-2): {n_safe:,}  ({n_safe/total*100:.1f}%)")
print(f"  ⚠️  Frail    (3-5): {n_frail:,}  ({n_frail/total*100:.1f}%)")

print("\n  Frailty Score Distribution:")
dist = df["frailty_score"].value_counts().sort_index()
for score, count in dist.items():
    bar  = "█" * (count // 20)
    label = ["Very Strong","Strong","Somewhat Strong",
             "Somewhat Frail","Frail","Very Frail"][score]
    print(f"    {score} ({label:<16}) : {count:>4}  {bar}")

print("\n  Community Type Breakdown:")
for ct, grp in df.groupby("community_type"):
    pct_frail = grp["is_frail"].mean() * 100
    print(f"    {ct:<12} → {pct_frail:.1f}% frail")

print("\n  Key Clinical Stats (mean ± std):")
for col in ["age", "hemoglobin", "albumin", "creatinine", "num_comorbidities"]:
    m, s = df[col].mean(), df[col].std()
    print(f"    {col:<22}: {m:.2f} ± {s:.2f}")