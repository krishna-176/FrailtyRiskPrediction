# Product Requirements Document (PRD)
# Explainable Real-Time Frailty Risk Prediction System Using SDOH

**Version**: 1.0  
**Date**: 2026-03-09  
**Status**: Draft

---

## 1. Executive Summary

This document defines the requirements for an **Explainable Real-Time Frailty Risk Prediction System** that combines clinical health data (NHANES) with Social Determinants of Health (SDOH) indicators (US County dataset) to predict patient frailty risk, explain the predictions using SHAP, and recommend targeted interventions.

The system is a full-stack healthcare platform deployed via Docker microservices, comprising a Python ML service (FastAPI), a Java backend (Spring Boot), a MongoDB database, and a React + Vite frontend dashboard.

---

## 2. Problem Statement

Frailty is a clinical syndrome associated with aging, characterized by decreased reserve and resistance to stressors. Early identification of at-risk individuals — especially when accounting for social and environmental factors — enables timely clinical intervention and reduces healthcare costs.

Current clinical tools:
- Ignore SDOH factors that strongly modulate frailty risk
- Provide opaque predictions without clinical explanations
- Lack real-time web accessibility for clinicians

**This system addresses all three gaps.**

---

## 3. Goals & Success Criteria

| Goal | Success Criterion |
|------|-----------------|
| Accurate frailty prediction | ROC-AUC ≥ 0.80 on held-out test set |
| Explainable predictions | SHAP values computed per patient, top-5 risk factors surfaced |
| Real-time performance | ML inference < 500ms per request |
| Actionable recommendations | ≥ 1 intervention recommendation per predicted-frail patient |
| Full-stack deployment | All services operational via `docker compose up` |
| Data coverage | NHANES clinical features merged with US County SDOH by geographic FIPS code |

---

## 4. Stakeholders & Users

| Role | Needs |
|------|-------|
| **Clinician** | View patient frailty score, understand key risk drivers, receive care recommendations |
| **Care Coordinator** | Submit patient data, view prediction history, export reports |
| **Data Scientist** | Retrain model, inspect feature importance, evaluate model metrics |
| **System Administrator** | Deploy, monitor, and maintain Docker services |

---

## 5. Scope

### 5.1 In Scope

- Python data preprocessing and feature engineering pipeline (NHANES + US County SDOH)
- Fried Frailty Phenotype label generation
- XGBoost binary classifier with hyperparameter tuning
- SHAP global and local explainability
- Rule-based intervention recommendation engine
- FastAPI ML microservice (predict endpoint)
- Spring Boot API microservice (patient management, prediction history, gateway)
- MongoDB persistence (patients, predictions collections)
- React + Vite health dashboard (patient form, risk gauge, SHAP charts, recommendations, history)
- Dockerfiles and Docker Compose configuration for all services
- `.gitignore` covering all generated artifacts

### 5.2 Out of Scope

- Real-time data ingestion from EHR systems
- User authentication / RBAC (assumed single-role MVP)
- Longitudinal trend analytics beyond stored prediction history
- HIPAA compliance infrastructure (de-identified data only for MVP)
- Mobile application

---

## 6. Functional Requirements

### 6.1 Data Preprocessing Pipeline (Python)

| ID | Requirement |
|----|-------------|
| DP-01 | Load NHANES demographic, health condition, physical activity, nutrition, and lab results data from CSV/Excel files |
| DP-02 | Load US County SDOH dataset (poverty rate, education, employment, median income, healthcare access, housing quality, food insecurity, environmental indicators) |
| DP-03 | Handle missing values via median imputation (numeric) and mode imputation (categorical) |
| DP-04 | Detect and cap outliers at 1.5×IQR boundaries |
| DP-05 | Remove duplicate rows |
| DP-06 | Merge NHANES with US County SDOH on `county_fips` / geographic identifiers; rows without a match use population-level medians |
| DP-07 | Apply `StandardScaler` to continuous clinical variables |
| DP-08 | Apply `MinMaxScaler` to SDOH index scores bounded to [0,1] |

### 6.2 Feature Engineering

| ID | Requirement |
|----|-------------|
| FE-01 | Compute BMI = weight(kg) / height(m)² |
| FE-02 | Compute Activity Score as weighted sum of moderate and vigorous physical activity minutes |
| FE-03 | Compute Comorbidity Index as count of active chronic conditions (diabetes, hypertension, heart disease, COPD, stroke) |
| FE-04 | Compute Socioeconomic Risk Index = normalized composite of poverty rate, unemployment rate, and food insecurity rate |
| FE-05 | Compute Healthcare Access Index = normalized composite of primary care provider ratio, insurance coverage rate, and preventive screening utilization |
| FE-06 | Compute Environmental Risk Score = normalized composite of pollution index, housing quality index, and transportation access |
| FE-07 | One-hot encode nominal categorical variables (e.g., gender, race/ethnicity, marital status) |
| FE-08 | Label encode ordinal categorical variables (e.g., education level, self-reported health status) |

### 6.3 Frailty Label Generation (Fried Phenotype)

| ID | Requirement |
|----|-------------|
| FL-01 | Criterion 1 – Unintentional weight loss: flag if reported ≥ 10 lb loss in past year or BMI < 18.5 |
| FL-02 | Criterion 2 – Weakness: flag if grip strength below age/gender-adjusted 20th percentile threshold |
| FL-03 | Criterion 3 – Slow walking speed: flag if gait speed below age/gender-adjusted 20th percentile threshold |
| FL-04 | Criterion 4 – Low physical activity: flag if weekly kilocalorie expenditure below gender-adjusted 20th percentile |
| FL-05 | Criterion 5 – Exhaustion: flag if CES-D exhaustion items score ≥ 2 |
| FL-06 | `frailty_score` = sum of 5 binary criteria (range 0–5) |
| FL-07 | `is_frail` = 1 if `frailty_score` ≥ 3, else 0 |

### 6.4 Machine Learning Model

| ID | Requirement |
|----|-------------|
| ML-01 | Train XGBoost binary classifier (`is_frail`) |
| ML-02 | 80/20 stratified train/test split with `random_state=42` |
| ML-03 | Hyperparameter tuning via `RandomizedSearchCV` (n_iter=50, 5-fold CV) over: `n_estimators`, `max_depth`, `learning_rate`, `subsample`, `colsample_bytree`, `min_child_weight` |
| ML-04 | Optimize for ROC-AUC scoring |
| ML-05 | Handle class imbalance via `scale_pos_weight` parameter |
| ML-06 | Persist trained model as `model.joblib` or `model.json` (XGBoost native format) |

### 6.5 Model Evaluation

| ID | Requirement |
|----|-------------|
| ME-01 | Report Accuracy, Precision, Recall, F1 Score, ROC-AUC on test set |
| ME-02 | Generate and save Confusion Matrix plot |
| ME-03 | Generate and save Feature Importance plot (XGBoost gain-based) |
| ME-04 | Generate and save ROC Curve plot |
| ME-05 | All evaluation artifacts saved to `ml-service/artifacts/` |

### 6.6 SHAP Explainability

| ID | Requirement |
|----|-------------|
| SH-01 | Compute SHAP values using `shap.TreeExplainer` on trained XGBoost model |
| SH-02 | Generate global SHAP summary plot (beeswarm) for top 20 features |
| SH-03 | Generate global feature importance bar plot |
| SH-04 | For each prediction, return per-feature SHAP values (local explanation) |
| SH-05 | Return top-5 risk-increasing features and their SHAP contributions |
| SH-06 | SHAP base value (expected value) included in API response |

### 6.7 Intervention Recommendation Engine

| ID | Requirement |
|----|-------------|
| IR-01 | Rule-based engine maps top SHAP features to clinical/social interventions |
| IR-02 | Rules (at minimum): |
| | - Low activity score → "Enroll in supervised exercise program (e.g., SilverSneakers)" |
| | - High Socioeconomic Risk Index → "Connect to social assistance programs (SNAP, Medicaid)" |
| | - Low Healthcare Access Index → "Schedule preventive screening; connect to telehealth" |
| | - High BMI → "Refer to nutritional counseling and weight management program" |
| | - High Comorbidity Index → "Multidisciplinary care plan review with primary physician" |
| | - High Environmental Risk Score → "Assess housing safety; refer to housing assistance" |
| | - Exhaustion criterion met → "Refer to mental health services; screen for depression" |
| IR-03 | Multiple recommendations can be returned per patient |
| IR-04 | Recommendations returned as a list of `{factor, recommendation, priority}` objects |

### 6.8 FastAPI ML Microservice

| ID | Requirement |
|----|-------------|
| FA-01 | POST `/predict` – accepts patient features as JSON, returns frailty prediction, SHAP explanation, and recommendations |
| FA-02 | GET `/health` – health check endpoint returning service status |
| FA-03 | GET `/model-info` – returns model version, training date, feature list |
| FA-04 | Input validation using Pydantic schemas |
| FA-05 | Model loaded at startup (not per-request) |
| FA-06 | CORS enabled for Spring Boot backend origin |
| FA-07 | Runs on port 8000 |

**POST `/predict` Request Schema:**
```json
{
  "age": 72,
  "gender": "female",
  "race_ethnicity": "non-hispanic white",
  "bmi": 24.5,
  "grip_strength": 18.2,
  "gait_speed": 0.7,
  "activity_score": 320,
  "exhaustion_score": 2,
  "weight_loss": false,
  "comorbidity_index": 3,
  "county_fips": "06037",
  "poverty_rate": 0.18,
  "education_index": 0.62,
  "employment_rate": 0.91,
  "median_income": 52000,
  "healthcare_access_index": 0.55,
  "housing_quality_index": 0.70,
  "food_insecurity_rate": 0.14,
  "environmental_risk_score": 0.35
}
```

**POST `/predict` Response Schema:**
```json
{
  "frailty_score": 3,
  "is_frail": 1,
  "probability": 0.78,
  "shap_values": {"feature_name": shap_value, "...": "..."},
  "base_value": 0.32,
  "top_risk_factors": [
    {"feature": "activity_score", "shap_value": -0.45, "direction": "increases_risk"},
    "..."
  ],
  "recommendations": [
    {"factor": "activity_score", "recommendation": "Enroll in supervised exercise program", "priority": "high"},
    "..."
  ]
}
```

### 6.9 Spring Boot Backend Microservice

| ID | Requirement |
|----|-------------|
| SB-01 | POST `/api/patients` – create patient record |
| SB-02 | GET `/api/patients/{id}` – retrieve patient by ID |
| SB-03 | GET `/api/patients` – list all patients (paginated) |
| SB-04 | PUT `/api/patients/{id}` – update patient record |
| SB-05 | DELETE `/api/patients/{id}` – delete patient record |
| SB-06 | POST `/api/predict` – receive patient features, call ML service, persist prediction, return result |
| SB-07 | GET `/api/history/{patientId}` – retrieve prediction history for a patient |
| SB-08 | GET `/api/history` – retrieve all predictions (paginated) |
| SB-09 | GET `/actuator/health` – Spring Boot health check |
| SB-10 | ML service URL configurable via environment variable `ML_SERVICE_URL` |
| SB-11 | MongoDB connection configurable via `MONGODB_URI` environment variable |
| SB-12 | Runs on port 8080 |
| SB-13 | CORS enabled for React frontend origin |

### 6.10 MongoDB Data Model

**Collection: `patients`**
```json
{
  "_id": "ObjectId",
  "name": "string",
  "age": "int",
  "gender": "string",
  "race_ethnicity": "string",
  "county_fips": "string",
  "county_name": "string",
  "health_features": {
    "bmi": "double",
    "grip_strength": "double",
    "gait_speed": "double",
    "activity_score": "double",
    "exhaustion_score": "int",
    "weight_loss": "boolean",
    "comorbidity_index": "int"
  },
  "sdoh_features": {
    "poverty_rate": "double",
    "education_index": "double",
    "employment_rate": "double",
    "median_income": "int",
    "healthcare_access_index": "double",
    "housing_quality_index": "double",
    "food_insecurity_rate": "double",
    "environmental_risk_score": "double"
  },
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

**Collection: `predictions`**
```json
{
  "_id": "ObjectId",
  "patient_id": "ObjectId",
  "frailty_score": "int",
  "is_frail": "boolean",
  "probability": "double",
  "shap_values": "object",
  "base_value": "double",
  "top_risk_factors": [
    {"feature": "string", "shap_value": "double", "direction": "string"}
  ],
  "recommendations": [
    {"factor": "string", "recommendation": "string", "priority": "string"}
  ],
  "model_version": "string",
  "timestamp": "ISODate"
}
```

### 6.11 React + Vite Frontend

| ID | Requirement |
|----|-------------|
| FE-UI-01 | **Patient Form** – structured input form with fields for all health and SDOH features; inline validation |
| FE-UI-02 | **Frailty Risk Score Gauge** – semicircular/radial gauge showing 0–5 score with color coding (green=0-1, yellow=2, orange=3-4, red=5) |
| FE-UI-03 | **Frailty Status Badge** – prominent label "Frail" (red) or "Not Frail" (green) with probability % |
| FE-UI-04 | **SHAP Feature Importance Chart** – horizontal bar chart of top-10 SHAP values (red=risk-increasing, blue=risk-decreasing) |
| FE-UI-05 | **Recommendations Panel** – card list of interventions grouped by priority (high/medium/low) |
| FE-UI-06 | **Prediction History Table** – paginated table showing past predictions for a selected patient |
| FE-UI-07 | **Patient Management** – create/view/search patients |
| FE-UI-08 | Navigation sidebar with sections: Dashboard, New Prediction, Patients, History |
| FE-UI-09 | Responsive layout (desktop primary, tablet acceptable) |
| FE-UI-10 | Loading states and error messages for all API calls |
| FE-UI-11 | Runs on port 5173 (Vite default) |

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NF-01 | **Performance** – ML inference latency ≤ 500ms (p95) |
| NF-02 | **Reliability** – All services restart automatically on failure (`restart: unless-stopped` in Docker Compose) |
| NF-03 | **Portability** – Single `docker compose up --build` command starts all services |
| NF-04 | **Data Privacy** – Only de-identified/synthetic data used; no PII stored in logs |
| NF-05 | **Code Quality** – Python code passes `flake8`; Java code compiles without warnings; React passes `eslint` |
| NF-06 | **Reproducibility** – All random seeds set to `42`; model artifacts versioned |

---

## 8. Project Folder Structure

```
project-root/
├── ml-service/
│   ├── data/
│   │   ├── nhanes/              # Raw NHANES CSV files
│   │   └── sdoh/                # US County SDOH CSV files
│   ├── notebooks/               # Exploratory analysis (optional)
│   ├── src/
│   │   ├── preprocessing/
│   │   │   ├── load_data.py
│   │   │   ├── clean_data.py
│   │   │   ├── merge_data.py
│   │   │   └── normalize.py
│   │   ├── features/
│   │   │   ├── engineering.py
│   │   │   └── frailty_labels.py
│   │   ├── model/
│   │   │   ├── train.py
│   │   │   ├── evaluate.py
│   │   │   └── predict.py
│   │   ├── explainability/
│   │   │   └── shap_explainer.py
│   │   ├── recommendations/
│   │   │   └── engine.py
│   │   └── pipeline.py          # End-to-end training pipeline
│   ├── api/
│   │   ├── main.py              # FastAPI app
│   │   ├── schemas.py           # Pydantic models
│   │   └── routers/
│   │       └── predict.py
│   ├── artifacts/               # Saved model, scalers, plots
│   ├── requirements.txt
│   └── Dockerfile
│
├── springboot-backend/
│   ├── src/main/java/com/frailty/
│   │   ├── FrailtyApplication.java
│   │   ├── controller/
│   │   │   ├── PatientController.java
│   │   │   └── PredictionController.java
│   │   ├── service/
│   │   │   ├── PatientService.java
│   │   │   ├── PredictionService.java
│   │   │   └── MLClientService.java
│   │   ├── model/
│   │   │   ├── Patient.java
│   │   │   └── Prediction.java
│   │   ├── repository/
│   │   │   ├── PatientRepository.java
│   │   │   └── PredictionRepository.java
│   │   └── config/
│   │       ├── CorsConfig.java
│   │       └── WebClientConfig.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── pom.xml
│   └── Dockerfile
│
├── react-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PatientForm/
│   │   │   ├── FrailtyGauge/
│   │   │   ├── ShapChart/
│   │   │   ├── RecommendationsPanel/
│   │   │   └── HistoryTable/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewPrediction.jsx
│   │   │   ├── Patients.jsx
│   │   │   └── History.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
│
├── docker/
│   └── docker-compose.yml
│
└── .gitignore
```

---

## 9. Docker Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Docker Network                         │
│                                                          │
│  ┌──────────────┐    ┌─────────────────┐                │
│  │    React      │    │   Spring Boot   │                │
│  │  Frontend     │───▶│    Backend      │                │
│  │  :5173        │    │    :8080        │                │
│  └──────────────┘    └────────┬────────┘                │
│                               │                          │
│                    ┌──────────▼────────┐                 │
│                    │   FastAPI ML      │                 │
│                    │   Service         │                 │
│                    │   :8000           │                 │
│                    └──────────┬────────┘                 │
│                               │                          │
│                    ┌──────────▼────────┐                 │
│                    │    MongoDB        │                 │
│                    │    :27017         │                 │
│                    └───────────────────┘                 │
└──────────────────────────────────────────────────────────┘
```

**Services:**
| Service | Image Base | Port | Dependencies |
|---------|-----------|------|--------------|
| `frontend` | node:20-alpine | 5173 | `backend` |
| `backend` | eclipse-temurin:21-jre | 8080 | `ml-service`, `mongodb` |
| `ml-service` | python:3.11-slim | 8000 | *(none at runtime)* |
| `mongodb` | mongo:7 | 27017 | *(none)* |

---

## 10. Synthetic Data Strategy

Since raw NHANES and US County files may not be redistributable, the system will:

1. Include a **data generation script** (`ml-service/data/generate_synthetic_data.py`) that creates realistic synthetic NHANES and SDOH datasets with proper distributions
2. Use these synthetic datasets for the entire pipeline, training, and demo
3. Schema will be compatible with real NHANES/SDOH CSV files when dropped into `data/nhanes/` and `data/sdoh/`

---

## 11. Assumptions & Decisions

| # | Assumption / Decision |
|---|----------------------|
| A1 | Authentication is out of scope for MVP; all endpoints are publicly accessible within the Docker network |
| A2 | Synthetic data will be used for training; schema matches real NHANES/SDOH format for drop-in replacement |
| A3 | The model will be pre-trained during the Docker image build (baked into the ML service image) |
| A4 | SHAP force plots are provided as JSON data for the frontend to render as bar charts (not server-side images), enabling real-time interactivity |
| A5 | Spring Boot uses reactive `WebClient` (not RestTemplate) to call the ML service |
| A6 | MongoDB runs without authentication in the Docker Compose dev environment |
| A7 | Frontend communicates with Spring Boot backend only; it does NOT call the ML service directly |
| A8 | Hyperparameter tuning runs during the Docker build; best params are saved with the model |
| A9 | County FIPS code is a string (zero-padded 5-digit, e.g., "06037") |
| A10 | All monetary values (median income) are stored in USD as integers |

---

## 12. Acceptance Criteria

| Criterion | Pass Condition |
|-----------|---------------|
| Data pipeline runs end-to-end | `python pipeline.py` completes without errors and saves model artifacts |
| Model performance | ROC-AUC ≥ 0.75 on synthetic test data |
| API responds correctly | `POST /predict` returns valid JSON with all required fields |
| Backend saves to DB | Patient and prediction records persisted in MongoDB |
| Frontend loads | Dashboard renders in browser at `http://localhost:5173` |
| Full stack up | `docker compose up --build` starts all 4 services successfully |
| SHAP chart renders | Feature importance chart displays after prediction |
| Recommendations shown | At least 1 recommendation returned for frail patients |
