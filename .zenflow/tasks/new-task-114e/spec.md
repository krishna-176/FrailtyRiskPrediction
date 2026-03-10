# Technical Specification
# Explainable Real-Time Frailty Risk Prediction System Using SDOH

**Version**: 1.1 (updated to reflect real datasets)
**Date**: 2026-03-09  
**Based on**: requirements.md v1.0 + actual dataset inspection

---

## 1. Technical Context

### 1.1 Greenfield Project
This is a new project with no existing codebase. All services are created from scratch following the folder structure defined in requirements.md §8.

**Project Root**: `D:\ZenFlow\`  
**Dataset Source**: `C:\Users\krish\Downloads\files\`  
All project files will be created under `D:\ZenFlow\frailty-system\` with the following top-level layout:
```
D:\ZenFlow\frailty-system\
├── .gitignore
├── ml-service\
├── springboot-backend\
├── react-frontend\
└── docker\
```
During implementation, `patient_frailty_final.csv` and raw data files will be copied from `C:\Users\krish\Downloads\files\` into `D:\ZenFlow\frailty-system\ml-service\data\`.

### 1.2 Real Dataset Summary

The user has already downloaded and pre-processed the datasets. The pipeline will use:

| File | Role |
|------|------|
| `patient_frailty_final.csv` | **Primary ML input** — 2,076 patients, 22 columns, already merged + labeled |
| `merged_clean.csv` | Intermediate merged file (no frailty labels) |
| `DEMO_J.csv`, `BMX_J.csv`, `BPX_J.csv`, `CBC_J.csv`, `BIOPRO_J.csv`, `MCQ_J.csv` | Raw NHANES J-cycle (2017-2018) files |
| `community_type.csv`, `median_income.csv`, `poverty_rate.csv`, `education_bachelors_pct.csv`, `unemployment_rate.csv`, `insurance_coverage.csv`, `disability_rate.csv`, `housing_cost.csv` | Raw SDOH county-level CSVs |
| `MergeData.py` | Existing merge script (NHANES + SDOH → `merged_clean.csv`) |
| `CalcFrailty.py` | Existing frailty scoring script (`merged_clean.csv` → `patient_frailty_final.csv`) |

**Class distribution**: 1,260 not frail (60.7%) / 816 frail (39.3%) — moderately imbalanced.

### 1.3 Actual Feature Schema (`patient_frailty_final.csv`)

**Clinical Features (NHANES-derived):**
| Column | Type | Description |
|--------|------|-------------|
| `patient_id` | str | P0001…P2076 |
| `age` | float | Age in years (50–90) |
| `gender` | int | 0=Female, 1=Male |
| `bmi` | float | Body mass index |
| `hemoglobin` | float | g/dL |
| `hematocrit` | float | % |
| `platelet_count` | float | 10³/µL |
| `num_comorbidities` | int | Count 0–5 |
| `systolic_bp` | float | mmHg |
| `creatinine` | float | mg/dL (kidney function) |
| `albumin` | float | g/dL (nutrition marker) |

**SDOH Features (County-level):**
| Column | Type | Description |
|--------|------|-------------|
| `community_type` | str | Urban/Suburban/Small Town/Rural/Frontier |
| `median_income` | float | USD |
| `poverty_rate` | float | Percentage (e.g., 24.33) |
| `education_bachelors_pct` | float | % with bachelor's degree |
| `unemployment_rate` | float | Percentage |
| `no_health_insurance_pct` | float | % uninsured |
| `disability_rate` | float | Percentage |
| `no_vehicle_pct` | float | % households without vehicle |
| `median_housing_cost` | float | Monthly rent (USD) |

**Labels:**
| Column | Type | Description |
|--------|------|-------------|
| `frailty_score` | int | 0–5 composite score |
| `is_frail` | int | 1 if score ≥ 3, else 0 |

### 1.4 Frailty Scoring Logic (from `CalcFrailty.py`)

```
score = 0
+ age > 75 → +1.5 | > 65 → +1.0 | > 55 → +0.5
+ hemoglobin < 11 → +1.0 | < 12.5 → +0.5
+ num_comorbidities × 0.3  (max +1.5)
+ albumin < 3.2 → +0.5 | < 3.5 → +0.25
+ creatinine > 2.0 → +0.5 | > 1.5 → +0.25
+ community_type: Frontier→+1.5, Rural→+1.0, Small Town→+0.5, Suburban→+0.25
+ poverty_rate > 25% → +0.5 | > 15% → +0.25
+ Gaussian noise N(0, 0.4)
→ clip to [0,5], round to int
is_frail = 1 if frailty_score ≥ 3
```

### 1.5 Technology Versions

| Component | Technology | Version |
|-----------|-----------|---------|
| ML Service | Python | 3.11 (Docker) / 3.13 (host) |
| ML Framework | XGBoost | 2.x |
| API Framework | FastAPI | 0.111.x |
| Explainability | SHAP | 0.45.x |
| Data | Pandas / NumPy | 2.x / 1.x |
| Backend | Java / Spring Boot | 21 / 3.3.x |
| Reactive HTTP | Spring WebFlux (WebClient) | 3.3.x |
| Database | MongoDB | 7 (Spring Data MongoDB Reactive) |
| Frontend | React + Vite | 18 / 5.x |
| Charts | Recharts | 2.x |
| Container Runtime | Docker / Docker Compose | 26 / v2 |

### 1.6 Python ML Service Dependencies (`ml-service/requirements.txt`)
```
fastapi==0.111.1
uvicorn[standard]==0.30.1
pydantic==2.7.1
pandas==2.2.2
numpy==1.26.4
scikit-learn==1.5.0
xgboost==2.0.3
shap==0.45.1
joblib==1.4.2
matplotlib==3.9.0
seaborn==0.13.2
```

### 1.7 Spring Boot Dependencies (`pom.xml`)
- `spring-boot-starter-webflux`
- `spring-boot-starter-data-mongodb-reactive`
- `spring-boot-starter-actuator`
- `spring-boot-starter-validation`
- `lombok`

### 1.8 React Frontend Dependencies (`package.json`)
- `react`, `react-dom` 18.x
- `react-router-dom` 6.x
- `axios` 1.x
- `recharts` 2.x
- `vite` 5.x + `@vitejs/plugin-react`

---

## 2. Implementation Approach

### 2.1 ML Service Architecture

**Phase A – Training Pipeline** (runs at Docker build time via `RUN python src/pipeline.py`):
1. `src/preprocessing/load_data.py` — loads `data/patient_frailty_final.csv`
2. `src/preprocessing/clean_data.py` — handles remaining NaN, outlier capping
3. `src/features/engineering.py` — encodes `community_type` (label/ordinal), derives composite indices
4. `src/model/train.py` — XGBoost + `RandomizedSearchCV`, saves artifacts
5. `src/model/evaluate.py` — metrics + plots
6. `src/explainability/shap_explainer.py` — global SHAP summary plots

**Phase B – FastAPI Inference Service** (runs at container start):
- `api/main.py` loads model + scaler + feature columns once at lifespan startup
- `POST /predict` validates input → transforms → predicts → SHAP → recommendations → returns JSON

### 2.2 Data Loading Strategy

The pipeline loads `patient_frailty_final.csv` directly (already merged and labeled). The raw NHANES + SDOH CSVs and `MergeData.py` / `CalcFrailty.py` are copied into `ml-service/data/` for full reproducibility but are **not re-run** in the Docker build (they require the original downloaded files to be mounted).

```
ml-service/data/
├── patient_frailty_final.csv   ← primary input (copied from user's files)
├── merged_clean.csv             ← intermediate (copied, for reference)
└── raw/
    ├── nhanes/                  ← DEMO_J.csv, BMX_J.csv, etc. (mounted or copied)
    └── sdoh/                    ← community_type.csv, poverty_rate.csv, etc.
```

### 2.3 Feature Engineering Pipeline

Inference uses the identical transformation as training. Steps applied to a single-row DataFrame:

```
raw_input (19 features)
  → community_type_encoded (ordinal: Urban=0, Suburban=1, Small Town=2, Rural=3, Frontier=4)
  → StandardScaler on continuous clinical: [age, bmi, hemoglobin, hematocrit, platelet_count,
      num_comorbidities, systolic_bp, creatinine, albumin]
  → MinMaxScaler on SDOH continuous: [median_income, poverty_rate, education_bachelors_pct,
      unemployment_rate, no_health_insurance_pct, disability_rate, no_vehicle_pct, median_housing_cost]
  → reindex to feature_columns.json (ensure consistent column order)
```

Scaler artifacts: `artifacts/clinical_scaler.joblib`, `artifacts/sdoh_scaler.joblib`, `artifacts/community_type_encoder.json`, `artifacts/feature_columns.json`

### 2.4 XGBoost Model

```python
param_distributions = {
    "n_estimators":      [100, 200, 300, 500],
    "max_depth":         [3, 4, 5, 6, 7],
    "learning_rate":     [0.01, 0.05, 0.1, 0.2],
    "subsample":         [0.6, 0.7, 0.8, 0.9, 1.0],
    "colsample_bytree":  [0.6, 0.7, 0.8, 0.9, 1.0],
    "min_child_weight":  [1, 3, 5, 7],
}
# scale_pos_weight = 1260/816 ≈ 1.54 (mild imbalance correction)
RandomizedSearchCV(XGBClassifier(...), param_distributions,
                   n_iter=50, cv=5, scoring="roc_auc", random_state=42)
```

### 2.5 SHAP Explainability

```python
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_instance)  # shape (1, n_features)
base_value = explainer.expected_value             # scalar for binary classifier

top_5 = sorted(zip(feature_names, shap_values[0]),
               key=lambda x: abs(x[1]), reverse=True)[:5]
direction = "increases_risk" if shap_val > 0 else "decreases_risk"
```

### 2.6 Recommendation Engine (Mapped to Actual Features)

Rules are applied based on SHAP-identified top risk factors:

```python
RULES = [
    # Clinical
    Rule("hemoglobin",            direction="low",  threshold=12.5,  priority="high",
         recommendation="Evaluate for anemia; consider iron/B12 supplementation and CBC follow-up"),
    Rule("albumin",               direction="low",  threshold=3.5,   priority="high",
         recommendation="Nutritional assessment and dietitian referral for protein-calorie support"),
    Rule("creatinine",            direction="high", threshold=1.5,   priority="high",
         recommendation="Nephrology referral; monitor kidney function and medication dosing"),
    Rule("num_comorbidities",     direction="high", threshold=2,     priority="high",
         recommendation="Multidisciplinary care plan review with primary physician"),
    Rule("bmi",                   direction="high", threshold=30,    priority="medium",
         recommendation="Refer to nutritional counseling and weight management program"),
    Rule("systolic_bp",           direction="high", threshold=140,   priority="medium",
         recommendation="Blood pressure management review; lifestyle modifications"),
    Rule("age",                   direction="high", threshold=75,    priority="medium",
         recommendation="Comprehensive geriatric assessment; fall prevention program"),
    # SDOH
    Rule("community_type",        direction="high", threshold=2,     priority="high",
         recommendation="Connect to telehealth services; rural health outreach programs"),
    Rule("poverty_rate",          direction="high", threshold=15,    priority="high",
         recommendation="Connect to social assistance programs (SNAP, Medicaid, LIHEAP)"),
    Rule("no_health_insurance_pct", direction="high", threshold=15, priority="high",
         recommendation="Assist with insurance enrollment (ACA marketplace, Medicaid)"),
    Rule("unemployment_rate",     direction="high", threshold=10,    priority="medium",
         recommendation="Refer to workforce development and social services programs"),
    Rule("disability_rate",       direction="high", threshold=20,    priority="medium",
         recommendation="Coordinate disability support services and adaptive equipment"),
    Rule("no_vehicle_pct",        direction="high", threshold=10,    priority="medium",
         recommendation="Arrange medical transportation assistance"),
]
```

### 2.7 Spring Boot Architecture

- Reactive stack: `@RestController` with `Mono`/`Flux` returns
- `MLClientService` uses `WebClient` → `POST http://{ML_SERVICE_URL}/predict`
- `PatientService` / `PredictionService` use `ReactiveMongoRepository`
- `CorsConfig`: allow `http://localhost:5173` + Docker frontend origin
- `WebClientConfig`: 30s timeout on ML calls

Request flow for `POST /api/predict`:
```
Frontend → POST /api/predict {patientId, features}
  → PatientService.findById(patientId)
  → MLClientService.predict(features) → FastAPI POST /predict
  → PredictionService.save(prediction)
  → Return PredictionResponse to frontend
```

### 2.8 Frontend Architecture

React SPA with `react-router-dom` routes:

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Summary stats, recent predictions |
| `/predict` | NewPrediction | Patient form + result display |
| `/patients` | Patients | Patient list + create/view |
| `/history` | History | Paginated prediction history |

State: `useState` / `useEffect` + `axios` service layer. Recharts for:
- `RadialBarChart` (frailty score gauge 0–5)
- `BarChart` horizontal (SHAP feature importance, red/blue)

---

## 3. Source Code Structure

```
project-root/
├── .gitignore
│
├── ml-service/
│   ├── data/
│   │   ├── patient_frailty_final.csv    ← primary training data (copied from user files)
│   │   ├── merged_clean.csv              ← intermediate reference
│   │   └── raw/
│   │       ├── nhanes/                   ← DEMO_J.csv, BMX_J.csv, BPX_J.csv, CBC_J.csv,
│   │       │                                BIOPRO_J.csv, MCQ_J.csv
│   │       └── sdoh/                     ← community_type.csv, median_income.csv,
│   │                                        poverty_rate.csv, education_bachelors_pct.csv,
│   │                                        unemployment_rate.csv, insurance_coverage.csv,
│   │                                        disability_rate.csv, housing_cost.csv
│   ├── src/
│   │   ├── preprocessing/
│   │   │   ├── __init__.py
│   │   │   ├── load_data.py             # load_patient_data() → DataFrame
│   │   │   └── clean_data.py            # handle_missing(), cap_outliers()
│   │   ├── features/
│   │   │   ├── __init__.py
│   │   │   └── engineering.py           # encode_community_type(), build_feature_matrix(),
│   │   │                                # fit_scalers(), apply_scalers(), save_artifacts()
│   │   ├── model/
│   │   │   ├── __init__.py
│   │   │   ├── train.py                 # train_model() → best_model, save model.joblib
│   │   │   ├── evaluate.py              # evaluate_model() → metrics dict, save plots
│   │   │   └── predict.py               # load_artifacts(), predict_single(features_dict)
│   │   ├── explainability/
│   │   │   ├── __init__.py
│   │   │   └── shap_explainer.py        # build_explainer(), explain_instance(),
│   │   │                                # global_summary_plot()
│   │   ├── recommendations/
│   │   │   ├── __init__.py
│   │   │   └── engine.py                # RULES list, get_recommendations(top_factors, raw_values)
│   │   └── pipeline.py                  # end-to-end training entry point
│   ├── api/
│   │   ├── main.py                      # FastAPI app, lifespan model loader
│   │   ├── schemas.py                   # PredictRequest, PredictResponse Pydantic models
│   │   └── routers/
│   │       ├── __init__.py
│   │       └── predict.py               # /predict, /health, /model-info
│   ├── artifacts/                        # model.joblib, clinical_scaler.joblib,
│   │                                    # sdoh_scaler.joblib, feature_columns.json,
│   │                                    # community_type_encoder.json, plots/
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
│   │   ├── dto/
│   │   │   ├── PredictRequest.java
│   │   │   ├── PredictResponse.java
│   │   │   ├── PatientRequest.java
│   │   │   └── PatientResponse.java
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
│   │   │   ├── PatientForm/PatientForm.jsx
│   │   │   ├── FrailtyGauge/FrailtyGauge.jsx
│   │   │   ├── ShapChart/ShapChart.jsx
│   │   │   ├── RecommendationsPanel/RecommendationsPanel.jsx
│   │   │   ├── HistoryTable/HistoryTable.jsx
│   │   │   └── Sidebar/Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewPrediction.jsx
│   │   │   ├── Patients.jsx
│   │   │   └── History.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
│
└── docker/
    └── docker-compose.yml
```

---

## 4. Data Models & API Contracts

### 4.1 FastAPI Pydantic Schemas (`api/schemas.py`)

```python
from pydantic import BaseModel, Field
from typing import Literal

class PredictRequest(BaseModel):
    # Clinical
    age: float = Field(ge=50, le=90)
    gender: int = Field(ge=0, le=1)          # 0=Female, 1=Male
    bmi: float = Field(ge=10.0, le=80.0)
    hemoglobin: float = Field(ge=5.0, le=20.0)
    hematocrit: float = Field(ge=10.0, le=60.0)
    platelet_count: float = Field(ge=20.0, le=800.0)
    num_comorbidities: int = Field(ge=0, le=5)
    systolic_bp: float = Field(ge=70.0, le=250.0)
    creatinine: float = Field(ge=0.3, le=10.0)
    albumin: float = Field(ge=1.5, le=6.0)
    # SDOH
    community_type: Literal["Urban", "Suburban", "Small Town", "Rural", "Frontier"]
    median_income: float = Field(ge=0)
    poverty_rate: float = Field(ge=0, le=100)
    education_bachelors_pct: float = Field(ge=0, le=100)
    unemployment_rate: float = Field(ge=0, le=100)
    no_health_insurance_pct: float = Field(ge=0, le=100)
    disability_rate: float = Field(ge=0, le=100)
    no_vehicle_pct: float = Field(ge=0, le=100)
    median_housing_cost: float = Field(ge=0)

class RiskFactor(BaseModel):
    feature: str
    shap_value: float
    direction: Literal["increases_risk", "decreases_risk"]

class Recommendation(BaseModel):
    factor: str
    recommendation: str
    priority: Literal["high", "medium", "low"]

class PredictResponse(BaseModel):
    frailty_score: int                          # 0–5
    is_frail: int                               # 0 or 1
    probability: float                          # XGBoost predict_proba score
    shap_values: dict[str, float]               # all features
    base_value: float
    top_risk_factors: list[RiskFactor]          # top 5 by |shap|
    recommendations: list[Recommendation]
```

### 4.2 MongoDB Documents (Spring Boot)

```java
// Patient.java — @Document("patients")
{
  _id, name, age, gender,
  bmi, hemoglobin, hematocrit, plateletCount,
  numComorbidities, systolicBp, creatinine, albumin,
  communityType, medianIncome, povertyRate,
  educationBachelorsPct, unemploymentRate,
  noHealthInsurancePct, disabilityRate,
  noVehiclePct, medianHousingCost,
  createdAt, updatedAt
}

// Prediction.java — @Document("predictions")
{
  _id, patientId, frailtyScore, isFrail, probability,
  shapValues: {feature: value},
  baseValue,
  topRiskFactors: [{feature, shapValue, direction}],
  recommendations: [{factor, recommendation, priority}],
  modelVersion, timestamp
}
```

### 4.3 Spring Boot REST API

| Method | Path | Body / Params | Response |
|--------|------|--------------|----------|
| POST | `/api/patients` | `PatientRequest` | `PatientResponse` 201 |
| GET | `/api/patients` | `?page=0&size=20` | `Page<PatientResponse>` |
| GET | `/api/patients/{id}` | — | `PatientResponse` |
| PUT | `/api/patients/{id}` | `PatientRequest` | `PatientResponse` |
| DELETE | `/api/patients/{id}` | — | 204 |
| POST | `/api/predict` | `{patientId, ...features}` | `PredictionResponse` |
| GET | `/api/history` | `?page=0&size=20` | `Page<PredictionResponse>` |
| GET | `/api/history/{patientId}` | — | `List<PredictionResponse>` |

### 4.4 Frontend API Service (`src/services/api.js`)

```js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const createPatient = (data) => axios.post(`${BASE}/api/patients`, data)
export const getPatients = (page = 0) => axios.get(`${BASE}/api/patients?page=${page}`)
export const getPatient = (id) => axios.get(`${BASE}/api/patients/${id}`)
export const predict = (patientId, features) =>
  axios.post(`${BASE}/api/predict`, { patientId, ...features })
export const getHistory = (page = 0) => axios.get(`${BASE}/api/history?page=${page}`)
export const getPatientHistory = (patientId) =>
  axios.get(`${BASE}/api/history/${patientId}`)
```

---

## 5. Docker Deployment

### 5.1 Service Configuration

```yaml
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
    restart: unless-stopped

  ml-service:
    build: ../ml-service
    ports: ["8000:8000"]
    restart: unless-stopped

  backend:
    build: ../springboot-backend
    ports: ["8080:8080"]
    environment:
      MONGODB_URI: mongodb://mongodb:27017/frailtydb
      ML_SERVICE_URL: http://ml-service:8000
    depends_on: [mongodb, ml-service]
    restart: unless-stopped

  frontend:
    build: ../react-frontend
    ports: ["5173:5173"]
    environment:
      VITE_API_URL: http://localhost:8080
    depends_on: [backend]
    restart: unless-stopped

volumes:
  mongo_data:
```

### 5.2 Dockerfile Strategies

**ml-service/Dockerfile** — training happens at build time:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# patient_frailty_final.csv is included in the image
RUN python src/pipeline.py
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**springboot-backend/Dockerfile** — multi-stage Maven build:
```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**react-frontend/Dockerfile** — Vite build + serve:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist
CMD ["serve", "-s", "dist", "-l", "5173"]
```

### 5.3 Root `.gitignore`
```
__pycache__/
*.pyc
.venv/
venv/
ml-service/artifacts/*.joblib
ml-service/artifacts/*.json
ml-service/artifacts/*.png
ml-service/artifacts/plots/
react-frontend/node_modules/
react-frontend/dist/
springboot-backend/target/
*.log
.idea/
.vscode/
*.iml
```

---

## 6. Delivery Phases

### Phase 1 – Project Scaffold & Infrastructure
- Root `.gitignore`, `docker/docker-compose.yml`
- Empty folder structure with `__init__.py` files
- Spring Boot `pom.xml` + `FrailtyApplication.java`
- React `package.json` + `vite.config.js`
- ML `requirements.txt`
- Copy `patient_frailty_final.csv` and raw data files into `ml-service/data/`

### Phase 2 – ML Preprocessing & Feature Engineering
- `src/preprocessing/load_data.py` — load `patient_frailty_final.csv`
- `src/preprocessing/clean_data.py` — cap outliers, fill residual NaN
- `src/features/engineering.py` — encode `community_type`, fit+apply scalers, save artifacts
- Verify: output DataFrame has no NaN, correct shape

### Phase 3 – Model Training & Evaluation
- `src/model/train.py` — XGBoost + `RandomizedSearchCV` (n_iter=50, 5-fold, ROC-AUC)
- `src/model/evaluate.py` — Accuracy, Precision, Recall, F1, ROC-AUC; save Confusion Matrix, ROC Curve, Feature Importance plots
- `src/pipeline.py` — end-to-end runner
- Verify: ROC-AUC ≥ 0.75 printed to stdout

### Phase 4 – SHAP & Recommendations
- `src/explainability/shap_explainer.py` — `TreeExplainer`, global summary plot
- `src/recommendations/engine.py` — rule-based engine mapped to actual features
- `src/model/predict.py` — `load_artifacts()`, `predict_single()` (used by API)
- Verify: `predict_single()` returns valid dict with all required keys

### Phase 5 – FastAPI ML Microservice
- `api/schemas.py` — Pydantic v2 `PredictRequest` / `PredictResponse`
- `api/main.py` — lifespan loader, CORS, route registration
- `api/routers/predict.py` — `/predict`, `/health`, `/model-info`
- Verify: `POST /predict` returns valid JSON; `GET /health` returns 200

### Phase 6 – Spring Boot Backend
- MongoDB documents (`Patient`, `Prediction`), repositories, services, controllers
- `application.yml` with env var placeholders for `MONGODB_URI`, `ML_SERVICE_URL`
- DTOs with Bean Validation annotations
- Verify: `mvn compile` passes; `POST /api/patients` + `POST /api/predict` flow works

### Phase 7 – React Frontend
- Sidebar + Router layout (`App.jsx`)
- `PatientForm` — all 19 feature inputs with validation; `community_type` as dropdown
- `FrailtyGauge` — `RadialBarChart` 0–5 scale, color-coded
- `ShapChart` — horizontal `BarChart`, positive=red / negative=blue
- `RecommendationsPanel` — cards grouped by priority
- `HistoryTable` — paginated table
- Wire all pages to `services/api.js`
- Verify: `npm run build` succeeds; `npm run lint` passes

### Phase 8 – Docker Integration
- All Dockerfiles
- `docker-compose.yml`
- Verify: `docker compose up --build` starts all 4 services
- Smoke test: create patient → predict → view history

---

## 7. Verification Approach

### Python (ML Service)
```bash
cd ml-service
pip install -r requirements.txt
python src/pipeline.py          # prints ROC-AUC; should be ≥ 0.75
uvicorn api.main:app --reload   # starts at :8000
# Lint
pip install flake8
flake8 src/ api/ --max-line-length=120
```

### Spring Boot
```bash
cd springboot-backend
mvn compile
mvn package -DskipTests
```

### React Frontend
```bash
cd react-frontend
npm install
npm run build
npm run lint
```

### Full Stack
```bash
cd docker
docker compose up --build
curl http://localhost:8000/health
curl http://localhost:8080/actuator/health
# Open http://localhost:5173
```

---

## 8. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Use `patient_frailty_final.csv` directly as training input | Already merged and labeled; avoids re-running `MergeData.py` + `CalcFrailty.py` inside Docker which would require all 14 raw files to be present |
| Raw files copied into `ml-service/data/raw/` | Preserves reproducibility — anyone can re-run the full pipeline from scratch if needed |
| `scale_pos_weight = 1.54` (1260/816) | Corrects mild class imbalance; maintains calibrated probability outputs |
| `community_type` ordinal-encoded (not one-hot) | Preserves natural urban→frontier severity ordering that matches frailty scoring logic |
| SHAP values as JSON in API response | Enables frontend to render interactive Recharts bar charts without server-side image generation |
| `feature_columns.json` artifact | Guarantees inference column order matches training; prevents silent misalignment |
| `RandomizedSearchCV` n_iter=50 | Computationally feasible in Docker build (~2–5 min) while tuning 6 hyperparameters |
| Reactive Spring WebFlux | Non-blocking I/O for ML service calls; aligns with reactive MongoDB driver |
| Model baked into Docker image | Eliminates runtime dependency on file system; single `docker compose up` starts everything |
