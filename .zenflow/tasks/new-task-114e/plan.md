# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

If you are blocked and need user clarification, mark the current step with `[!]` in plan.md before stopping.

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: 02efc157-00e0-4efa-b5c5-6bda5512073d -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification
<!-- chat-id: bc11df44-d46e-417c-92e3-34f7ef9464aa -->

Create a technical specification based on the PRD in `{@artifacts_path}/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning
<!-- chat-id: 46705394-499a-4131-80f7-1747eb9ef1ed -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

### [x] Step 1: Project Scaffold & Infrastructure
<!-- chat-id: e50c7f45-8c1e-4323-8cd1-7d119c896bf7 -->
Set up the root project structure, `.gitignore`, Docker Compose skeleton, and all package/dependency manifests.

- Create root `.gitignore` covering `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `ml-service/artifacts/*.joblib`, `ml-service/artifacts/*.json`, `ml-service/artifacts/*.png`, `ml-service/artifacts/plots/`, `react-frontend/node_modules/`, `react-frontend/dist/`, `springboot-backend/target/`, `*.log`, `.idea/`, `.vscode/`, `*.iml`
- Create directory tree: `ml-service/data/raw/nhanes/`, `ml-service/data/raw/sdoh/`, `ml-service/src/preprocessing/`, `ml-service/src/features/`, `ml-service/src/model/`, `ml-service/src/explainability/`, `ml-service/src/recommendations/`, `ml-service/api/routers/`, `ml-service/artifacts/`
- Create `ml-service/requirements.txt` (fastapi==0.111.1, uvicorn[standard]==0.30.1, pydantic==2.7.1, pandas==2.2.2, numpy==1.26.4, scikit-learn==1.5.0, xgboost==2.0.3, shap==0.45.1, joblib==1.4.2, matplotlib==3.9.0, seaborn==0.13.2)
- Add `__init__.py` files in all `src/` sub-packages and `api/routers/`
- Create `springboot-backend/pom.xml` with Java 21, Spring Boot 3.3.x, dependencies: `spring-boot-starter-webflux`, `spring-boot-starter-data-mongodb-reactive`, `spring-boot-starter-actuator`, `spring-boot-starter-validation`, `lombok`
- Create `springboot-backend/src/main/java/com/frailty/FrailtyApplication.java` (main class, `@SpringBootApplication`)
- Create `springboot-backend/src/main/resources/application.yml` with `spring.data.mongodb.uri: ${MONGODB_URI:mongodb://localhost:27017/frailtydb}` and `ml.service.url: ${ML_SERVICE_URL:http://localhost:8000}`
- Create `react-frontend/package.json` with react 18, react-dom, react-router-dom 6, axios 1.x, recharts 2.x, vite 5.x, @vitejs/plugin-react
- Create `react-frontend/vite.config.js`
- Create `react-frontend/index.html`
- Create `docker/docker-compose.yml` skeleton with all 4 services (mongodb, ml-service, backend, frontend) per spec §5.1

### [x] Step 2: ML Data Preprocessing & Feature Engineering
<!-- chat-id: 7f6d611a-534e-404e-b56f-4cdf9d601ffc -->
Implement the Python data loading, cleaning, and feature engineering pipeline.

- `ml-service/src/preprocessing/load_data.py`: `load_patient_data(path) -> DataFrame` — loads `patient_frailty_final.csv`, validates expected columns, returns DataFrame
- `ml-service/src/preprocessing/clean_data.py`: `handle_missing(df) -> DataFrame` (median/mode imputation), `cap_outliers(df, cols) -> DataFrame` (1.5×IQR capping), `remove_duplicates(df) -> DataFrame`
- `ml-service/src/features/engineering.py`:
  - `encode_community_type(df) -> (df, encoder_map)` — ordinal: Urban=0, Suburban=1, Small Town=2, Rural=3, Frontier=4; saves `artifacts/community_type_encoder.json`
  - `build_feature_matrix(df) -> (X, y)` — separates features from `frailty_score`/`is_frail` labels
  - `fit_scalers(X) -> (clinical_scaler, sdoh_scaler)` — StandardScaler on clinical columns, MinMaxScaler on SDOH columns
  - `apply_scalers(X, clinical_scaler, sdoh_scaler) -> X_scaled`
  - `save_artifacts(clinical_scaler, sdoh_scaler, feature_columns)` — saves `.joblib` and `feature_columns.json` to `artifacts/`
- Verify: `load_patient_data` + `clean_data` + `engineering` chain produces DataFrame with no NaN and correct shape (≈2076 rows, 19 feature columns)

### [x] Step 3: Model Training & Evaluation
<!-- chat-id: 33c47698-af08-4651-8e48-608797372641 -->
Implement XGBoost training pipeline, hyperparameter search, evaluation metrics, and plots.

- `ml-service/src/model/train.py`:
  - `train_model(X_train, y_train) -> best_estimator` using `RandomizedSearchCV` (n_iter=50, cv=5, scoring="roc_auc", random_state=42) over `XGBClassifier` with `scale_pos_weight=1.54`
  - Save `artifacts/model.joblib` via `joblib.dump`
- `ml-service/src/model/evaluate.py`:
  - `evaluate_model(model, X_test, y_test) -> dict` — computes Accuracy, Precision, Recall, F1, ROC-AUC; prints metrics
  - Generates and saves to `artifacts/plots/`: `confusion_matrix.png`, `roc_curve.png`, `feature_importance.png`
- `ml-service/src/pipeline.py`: end-to-end runner — load → clean → encode → split (80/20 stratified, random_state=42) → fit scalers → transform → train → evaluate → save all artifacts; prints final ROC-AUC
- Verify: `python src/pipeline.py` completes without error; prints ROC-AUC ≥ 0.75; `artifacts/model.joblib` created

### [x] Step 4: SHAP Explainability & Recommendation Engine
<!-- chat-id: aafbac3f-5d93-42a2-b32e-37dc13cc2c47 -->
Implement SHAP explainer, global summary plots, and rule-based recommendation engine.

- `ml-service/src/explainability/shap_explainer.py`:
  - `build_explainer(model) -> TreeExplainer`
  - `explain_instance(explainer, X_instance, feature_names) -> dict` — returns `{shap_values: {feature: val}, base_value: float, top_risk_factors: list[RiskFactor]}`; top_5 sorted by `|shap_val|`; direction = "increases_risk" if shap_val > 0 else "decreases_risk"
  - `global_summary_plot(explainer, X_test, feature_names)` — saves `artifacts/plots/shap_summary.png`
- `ml-service/src/recommendations/engine.py`:
  - Define `RULES` list with all 13 rules from spec §2.6
  - `get_recommendations(top_factors, raw_values) -> list[Recommendation]` — applies matching rules, returns `[{factor, recommendation, priority}]`
- `ml-service/src/model/predict.py`:
  - `load_artifacts() -> (model, clinical_scaler, sdoh_scaler, community_type_encoder, feature_columns)`
  - `predict_single(features_dict) -> PredictionResult` — applies full transformation pipeline → XGBoost `predict_proba` → SHAP → recommendations → returns complete result dict
- Verify: `predict_single` with a sample input dict returns valid dict with keys: `frailty_score`, `is_frail`, `probability`, `shap_values`, `base_value`, `top_risk_factors`, `recommendations`

### [x] Step 5: FastAPI ML Microservice
<!-- chat-id: 07d87774-3c4a-40d3-9780-fd9d5b399478 -->
Implement the FastAPI application with `/predict`, `/health`, and `/model-info` endpoints.

- `ml-service/api/schemas.py`: Pydantic v2 `PredictRequest`, `RiskFactor`, `Recommendation`, `PredictResponse` matching spec §4.1 — all field validators included
- `ml-service/api/main.py`: FastAPI app with `lifespan` context manager that calls `load_artifacts()` on startup; stores artifacts in `app.state`; registers CORS middleware (allow all origins in dev); includes routers
- `ml-service/api/routers/predict.py`:
  - `POST /predict` — validates `PredictRequest`, calls `predict_single`, returns `PredictResponse`
  - `GET /health` — returns `{"status": "ok", "model_loaded": bool}`
  - `GET /model-info` — returns model version, feature list, training timestamp
- `ml-service/Dockerfile`: FROM python:3.11-slim; pip install; COPY; `RUN python src/pipeline.py`; CMD uvicorn
- Verify: `uvicorn api.main:app --reload` starts on :8000; `GET /health` returns 200; `POST /predict` with valid payload returns `PredictResponse` JSON

### [x] Step 6: Spring Boot Backend
<!-- chat-id: ed25cc44-976e-4ef0-98c4-1bbdb91be2b6 -->
Implement the reactive Spring Boot backend with MongoDB persistence and ML service proxy.

- `com/frailty/model/Patient.java`: `@Document("patients")` with all fields from spec §4.2 + `createdAt`/`updatedAt` (`@CreatedDate`/`@LastModifiedDate`); use Lombok `@Data @Builder @NoArgsConstructor @AllArgsConstructor`
- `com/frailty/model/Prediction.java`: `@Document("predictions")` with all fields from spec §4.2; `shapValues` as `Map<String, Double>`; `topRiskFactors` and `recommendations` as nested record/class lists
- `com/frailty/repository/PatientRepository.java`: `ReactiveMongoRepository<Patient, String>`
- `com/frailty/repository/PredictionRepository.java`: `ReactiveMongoRepository<Prediction, String>`; add `findByPatientId(String patientId) -> Flux<Prediction>`
- `com/frailty/dto/`: `PatientRequest.java`, `PatientResponse.java`, `PredictRequest.java`, `PredictResponse.java` with `@NotNull`/`@Valid` Bean Validation annotations
- `com/frailty/service/PatientService.java`: CRUD using `PatientRepository`; maps `PatientRequest ↔ Patient ↔ PatientResponse`
- `com/frailty/service/PredictionService.java`: save/find predictions; maps response DTOs
- `com/frailty/service/MLClientService.java`: `WebClient` bean targeting `${ML_SERVICE_URL}/predict`; 30s timeout; `predict(PredictRequest) -> Mono<PredictResponse>`
- `com/frailty/controller/PatientController.java`: REST endpoints `POST/GET/PUT/DELETE /api/patients` per spec §4.3
- `com/frailty/controller/PredictionController.java`: `POST /api/predict` (fetch patient → call ML → save prediction → return); `GET /api/history`; `GET /api/history/{patientId}`
- `com/frailty/config/CorsConfig.java`: allow `http://localhost:5173` + any Docker frontend origin
- `com/frailty/config/WebClientConfig.java`: `WebClient.Builder` bean with 30s connect/read timeout
- `springboot-backend/Dockerfile`: multi-stage Maven 3.9 / Eclipse Temurin 21 build per spec §5.2
- Verify: `mvn compile` and `mvn package -DskipTests` pass without errors

### [x] Step 7: React Frontend
<!-- chat-id: 4bdff9e5-cb32-4210-936e-136b3dd64e7a -->
Implement the React + Vite healthcare dashboard with all pages, components, and API wiring.

- `src/services/api.js`: axios service layer with `createPatient`, `getPatients`, `getPatient`, `predict`, `getHistory`, `getPatientHistory` per spec §4.4; `VITE_API_URL` env var support
- `src/components/Sidebar/Sidebar.jsx`: navigation sidebar with links to Dashboard, New Prediction, Patients, History
- `src/components/PatientForm/PatientForm.jsx`: controlled form with all 19 feature inputs (age, gender, bmi, hemoglobin, hematocrit, platelet_count, num_comorbidities, systolic_bp, creatinine, albumin + all 9 SDOH fields); `community_type` as `<select>` dropdown; inline validation; submit calls `predict` API
- `src/components/FrailtyGauge/FrailtyGauge.jsx`: `RadialBarChart` (Recharts) showing 0–5 score; color-coded green(0-1)/yellow(2)/orange(3-4)/red(5); frailty status badge with probability %
- `src/components/ShapChart/ShapChart.jsx`: horizontal `BarChart` of top-10 SHAP values; positive values red, negative values blue; feature name labels
- `src/components/RecommendationsPanel/RecommendationsPanel.jsx`: card list grouped by priority (high/medium/low); each card shows factor + recommendation text
- `src/components/HistoryTable/HistoryTable.jsx`: paginated table showing past predictions (timestamp, frailty_score, is_frail, probability); pagination controls
- `src/pages/Dashboard.jsx`: summary stats cards (total patients, recent predictions, frail count); last 5 predictions list
- `src/pages/NewPrediction.jsx`: patient selector dropdown + `PatientForm`; renders `FrailtyGauge`, `ShapChart`, `RecommendationsPanel` after prediction
- `src/pages/Patients.jsx`: patient list with search; create new patient form; view individual patient
- `src/pages/History.jsx`: full `HistoryTable` with patient filter
- `src/App.jsx`: `BrowserRouter` with routes `/`, `/predict`, `/patients`, `/history`; `Sidebar` layout wrapper
- `src/index.css`: base styles (CSS reset, health-dashboard color scheme)
- `react-frontend/Dockerfile`: multi-stage node:20-alpine build per spec §5.2
- Verify: `npm run build` succeeds; `npm run lint` passes (ESLint); app loads at :5173 with working navigation

### [x] Step 8: Docker Integration & Full-Stack Smoke Test
<!-- chat-id: 640f9384-1748-4137-975e-4147487f2c9e -->
Complete all Dockerfiles, finalize Docker Compose, verify full-stack startup.

- Finalize `ml-service/Dockerfile`, `springboot-backend/Dockerfile`, `react-frontend/Dockerfile` (all per spec §5.2)
- Complete `docker/docker-compose.yml` with all 4 services, environment variables, `depends_on`, `restart: unless-stopped`, named volume `mongo_data`
- Add health-check `depends_on` conditions so backend waits for ml-service to be healthy
- Verify: `docker compose up --build` (from `docker/` dir) starts all 4 services without error
- Smoke test: `curl http://localhost:8000/health` → 200; `curl http://localhost:8080/actuator/health` → UP; `http://localhost:5173` loads dashboard
