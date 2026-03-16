import json
import sqlite3
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict
from fastapi.middleware.cors import CORSMiddleware

# Import prediction logic
from ml.predict import predict_student


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
METADATA_PATH = MODEL_DIR / "metadata.json"
DB_PATH = BASE_DIR / "database" / "students.db"


# --------------------------------------------------
# App Initialization
# --------------------------------------------------

app = FastAPI(
    title="Academic AI Guard API",
    version="5.2.2"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# UI Model → Backend Model Mapping
# --------------------------------------------------

MODEL_MAP = {
    "Logistic Regression": "logistic",
    "Extra Trees": "extra_trees",
    "XGBoost": "xgboost",
    "logistic": "logistic",
    "extra_trees": "extra_trees",
    "xgboost": "xgboost",
}


def normalize_model_name(name: str) -> str:

    if not name:
        return "logistic"

    if name in MODEL_MAP:
        return MODEL_MAP[name]

    return name.lower().replace(" ", "_")


# --------------------------------------------------
# Input Schema
# --------------------------------------------------

class StudentInput(BaseModel):

    model_config = ConfigDict(extra="allow")

    model: str

    term: int
    failed_courses: int

    attendance_rate: float
    stress_level: float
    extracurricular_score: float

    internship_completed: int
    family_income_level: int
    part_time_job: int
    scholarship: int
    campus_resident: int

    deviation: float

    # Optional rule-based fields
    degree: str | None = None
    credits_earned: float | None = None

    ge_credits: float | None = None
    humanities_credits: float | None = None

    pep_credits: float | None = None
    sip_credits: float | None = None
    short_iip_credits: float | None = None
    long_iip_credits: float | None = None
    ri_credits: float | None = None


# --------------------------------------------------
# Prediction Endpoint
# --------------------------------------------------

@app.post("/predict")
def predict(data: StudentInput):

    payload = data.model_dump(exclude_none=True)

    model_name = normalize_model_name(payload.get("model"))
    payload["model"] = model_name

    # Ensure rule fields always exist
    payload.setdefault("credits_earned", 0)

    payload.setdefault("ge_credits", 0)
    payload.setdefault("humanities_credits", 0)

    payload.setdefault("pep_credits", 0)
    payload.setdefault("sip_credits", 0)
    payload.setdefault("short_iip_credits", 0)
    payload.setdefault("long_iip_credits", 0)
    payload.setdefault("ri_credits", 0)

    try:

        result = predict_student(payload)

        if not isinstance(result, dict):
            raise ValueError("Invalid prediction response")

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# --------------------------------------------------
# Model Info Endpoint
# --------------------------------------------------

@app.get("/model-info")
def model_info():

    if not METADATA_PATH.exists():
        raise HTTPException(status_code=500, detail="Metadata missing")

    with open(METADATA_PATH) as f:
        metadata = json.load(f)

    latest_version = metadata["latest_version"]

    latest_entry = next(
        h for h in metadata["history"]
        if h["version"] == latest_version
    )

    all_models = latest_entry["models"]

    dashboard_models = {}

    if "logistic" in all_models:
        dashboard_models["logistic"] = all_models["logistic"]

    remaining_models = {
        k: v for k, v in all_models.items()
        if k != "logistic"
    }

    ranked_models = sorted(
        remaining_models.items(),
        key=lambda x: x[1].get("recall", x[1].get("recall_delayed", 0)),
        reverse=True
    )

    for name, metrics in ranked_models[:2]:

        normalized_metrics = metrics.copy()

        if "recall" not in normalized_metrics and "recall_delayed" in normalized_metrics:
            normalized_metrics["recall"] = normalized_metrics["recall_delayed"]

        dashboard_models[name] = normalized_metrics

    best_model = max(
        dashboard_models,
        key=lambda m: dashboard_models[m].get("recall", 0)
    )

    return {
        "version": latest_entry["version"],
        "selected_model": best_model,
        "dataset_size": latest_entry["dataset_size"],
        "metrics": dashboard_models
    }


# --------------------------------------------------
# Dataset Summary
# --------------------------------------------------

@app.get("/summary")
def summary():

    if not DB_PATH.exists():
        raise HTTPException(status_code=500, detail="Database not found")

    try:

        conn = sqlite3.connect(DB_PATH)

        df = pd.read_sql_query(
            "SELECT * FROM students",
            conn
        )

        conn.close()

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

    total = len(df)

    delayed = int(df["graduation_outcome"].sum())

    on_time = total - delayed

    return {
        "total_students": total,
        "delayed_percentage": round((delayed / total) * 100, 2),
        "on_time_percentage": round((on_time / total) * 100, 2)
    }


# --------------------------------------------------
# Retrain Endpoint
# --------------------------------------------------

@app.post("/retrain")
def retrain():

    try:

        from ml.train import train

        train()

        return {
            "message": "All models retrained successfully"
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Retraining failed: {str(e)}"
        )