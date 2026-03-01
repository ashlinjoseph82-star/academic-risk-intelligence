import joblib
import json
import sqlite3
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


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
app = FastAPI(title="Academic AI Guard API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Load Model By Name
# --------------------------------------------------
def load_model_by_name(model_name: str):
    if not METADATA_PATH.exists():
        raise HTTPException(status_code=500, detail="Model metadata not found.")

    with open(METADATA_PATH, "r") as f:
        metadata = json.load(f)

    latest_version = metadata.get("latest_version")

    if not latest_version:
        raise HTTPException(status_code=500, detail="No trained model available.")

    model_path = MODEL_DIR / latest_version / f"{model_name}.pkl"

    if not model_path.exists():
        raise HTTPException(
            status_code=400,
            detail=f"Model '{model_name}' not found in version {latest_version}",
        )

    model = joblib.load(model_path)
    return model, latest_version


# --------------------------------------------------
# Input Schema
# --------------------------------------------------
class StudentInput(BaseModel):
    model: str
    semester: int
    core_credits: int
    pep_credits: int
    humanities_credits: int
    internship_completed: int
    failed_courses: int
    total_credits: int
    expected_credits: int
    deviation: int


# --------------------------------------------------
# Predict Endpoint
# --------------------------------------------------
@app.post("/predict")
def predict(data: StudentInput):
    model, version = load_model_by_name(data.model.lower())

    input_data = data.model_dump()
    model_used = input_data.pop("model")

    df = pd.DataFrame([input_data])

    try:
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0][1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    risk_level = (
        "High" if probability > 0.7
        else "Medium" if probability > 0.4
        else "Low"
    )

    return {
        "prediction": "Delayed" if prediction == 1 else "On-Time",
        "probability": round(float(probability) * 100, 2),
        "risk_level": risk_level,
        "model_version": version,
        "model_used": model_used,
    }


# --------------------------------------------------
# Model Info Endpoint (FIXED FOR FRONTEND)
# --------------------------------------------------
@app.get("/model-info")
def model_info():
    if not METADATA_PATH.exists():
        raise HTTPException(status_code=500, detail="Metadata not found.")

    with open(METADATA_PATH, "r") as f:
        metadata = json.load(f)

    if not metadata.get("history"):
        raise HTTPException(status_code=500, detail="No training history found.")

    latest_entry = metadata["history"][-1]

    metrics = latest_entry["models"]

    # Automatically select best model by accuracy
    selected_model = max(
        metrics,
        key=lambda m: metrics[m]["accuracy"]
    )

    return {
        "version": latest_entry["version"],
        "selected_model": selected_model,
        "dataset_size": latest_entry["dataset_size"],
        "metrics": metrics,
    }


# --------------------------------------------------
# Dashboard Summary Endpoint
# --------------------------------------------------
@app.get("/summary")
def summary():
    if not DB_PATH.exists():
        raise HTTPException(status_code=500, detail="Database not found.")

    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM students", conn)
    conn.close()

    total = len(df)
    delayed = int(df["graduation_outcome"].sum())
    on_time = total - delayed

    return {
        "total_students": total,
        "delayed_percentage": round((delayed / total) * 100, 2),
        "on_time_percentage": round((on_time / total) * 100, 2),
    }


# --------------------------------------------------
# Retrain Endpoint
# --------------------------------------------------
@app.post("/retrain")
def retrain():
    try:
        from ml.train import train
        train()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "All models retrained successfully"}