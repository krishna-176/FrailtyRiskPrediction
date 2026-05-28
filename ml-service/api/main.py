"""FastAPI application entry point with lifespan model loader."""
import os
import sys
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers.predict import router as predict_router
from src.features.engineering import load_artifacts
from src.explainability.shap_explainer import build_explainer

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "../artifacts")


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_path = os.path.join(ARTIFACTS_DIR, "model.joblib")
    if not os.path.exists(model_path):
        raise RuntimeError(
            f"Model artifact not found at {model_path}. "
            "Run `python src/pipeline.py` first to train the model."
        )

    app.state.model = joblib.load(model_path)
    app.state.clinical_scaler, app.state.sdoh_scaler, \
        app.state.community_encoder, app.state.feature_columns = load_artifacts()
    app.state.explainer = build_explainer(app.state.model)

    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    if openai_key:
        print("[startup] OPENAI_API_KEY detected — AI-powered recommendations enabled")
    else:
        print("[startup] OPENAI_API_KEY not set — rule-based fallback will be used")

    print("[startup] Model and artifacts loaded successfully")
    yield
    print("[shutdown] Cleaning up resources")


app = FastAPI(
    title="Frailty Risk Prediction API",
    description="Explainable real-time frailty risk prediction using SDOH",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
