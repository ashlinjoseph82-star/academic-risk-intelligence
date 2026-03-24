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
DB_PATH = BASE_DIR / "database" / "students_v2.db"


# --------------------------------------------------
# App Initialization
# --------------------------------------------------

app = FastAPI(
    title="Academic AI Guard API",
    version="5.3.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# ROOT ROUTE
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Academic AI Guard API is running 🚀",
        "endpoints": {
            "predict": "POST /predict",
            "model_info": "GET /model-info",
            "summary": "GET /summary",
            "correlation": "GET /correlation",
            "scatter": "GET /scatter?x=col&y=col",
            "semester_progression": "GET /semester-progression",
            "retrain": "POST /retrain"
        }
    }


# --------------------------------------------------
# Model Mapping
# --------------------------------------------------

MODEL_MAP = {
    "Logistic Regression": "logistic",
    "Extra Trees": "extra_trees",
    "Random Forest": "random_forest",
    "XGBoost": "xgboost",
    "logistic": "logistic",
    "extra_trees": "extra_trees",
    "random_forest": "random_forest",
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
# Prediction
# --------------------------------------------------

@app.post("/predict")
def predict(data: StudentInput):

    payload = data.model_dump(exclude_none=True)
    payload["model"] = normalize_model_name(payload.get("model"))

    payload.setdefault("credits_earned", 0)
    payload.setdefault("term", 1)

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
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# Model Info
# --------------------------------------------------

@app.get("/model-info")
def model_info():

    if not METADATA_PATH.exists():
        raise HTTPException(status_code=500, detail="Metadata missing")

    with open(METADATA_PATH) as f:
        metadata = json.load(f)

    latest_version = metadata.get("latest_version")
    history = metadata.get("history", [])

    latest_entry = next((h for h in history if h.get("version") == latest_version), None)

    if not latest_entry:
        raise HTTPException(status_code=500, detail="Latest model not found")

    all_models = latest_entry.get("models", {})

    dashboard_models = {}
    if "logistic" in all_models:
        dashboard_models["logistic"] = all_models["logistic"]

    remaining = {k: v for k, v in all_models.items() if k != "logistic"}

    ranked = sorted(remaining.items(), key=lambda x: x[1].get("f1", 0), reverse=True)

    for name, metrics in ranked[:2]:
        dashboard_models[name] = metrics

    best_model = max(dashboard_models, key=lambda m: dashboard_models[m].get("f1", 0))

    return {
        "version": latest_entry["version"],
        "selected_model": best_model,
        "dataset_size": latest_entry.get("dataset_size", 0),
        "metrics": dashboard_models
    }


# --------------------------------------------------
# Summary
# --------------------------------------------------

@app.get("/summary")
def summary():

    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM students", conn)
    conn.close()

    total = len(df)
    if total == 0:
        return {"total_students": 0, "delayed_percentage": 0, "on_time_percentage": 0}

    delayed = int(df["graduation_outcome"].sum())
    on_time = total - delayed

    return {
        "total_students": total,
        "delayed_percentage": round((delayed / total) * 100, 2),
        "on_time_percentage": round((on_time / total) * 100, 2)
    }


# --------------------------------------------------
# CORRELATION
# --------------------------------------------------

@app.get("/correlation")
def correlation():

    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM students", conn)
    conn.close()

    numeric_df = df.select_dtypes(include=["number"])
    corr = numeric_df.corr().fillna(0)

    return {
        "columns": list(corr.columns),
        "matrix": corr.values.tolist()
    }


# --------------------------------------------------
# SCATTER
# --------------------------------------------------

@app.get("/scatter")
def scatter(x: str, y: str):

    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM students", conn)
    conn.close()

    if x not in df.columns or y not in df.columns:
        raise HTTPException(status_code=400, detail="Invalid columns")

    data = df[[x, y, "graduation_outcome"]].dropna()

    points = [
        {
            "x": float(row[x]),
            "y": float(row[y]),
            "outcome": int(row["graduation_outcome"])
        }
        for _, row in data.iterrows()
    ]

    return {
        "points": points,
        "available_cols": list(df.select_dtypes(include=["number"]).columns)
    }


# --------------------------------------------------
# ✅ FIXED SEMESTER PROGRESSION
# --------------------------------------------------

@app.get("/semester-progression")
def semester_progression():

    if not DB_PATH.exists():
        raise HTTPException(status_code=500, detail="Database not found")

    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query("SELECT * FROM students", conn)
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")

    required_cols = ["semester", "total_credits", "expected_credits", "deviation"]

    for col in required_cols:
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"Missing column: {col}")

    df = df.dropna(subset=required_cols)

    if df.empty:
        return {"data": []}

    grouped = (
        df.groupby("semester")
        .agg({
            "total_credits": "mean",
            "expected_credits": "mean",
            "deviation": "mean"
        })
        .reset_index()
        .sort_values("semester")
    )

    return {
        "data": [
            {
                "semester": int(row["semester"]),
                "avg_total": round(float(row["total_credits"]), 2),
                "avg_expected": round(float(row["expected_credits"]), 2),
                "avg_deviation": round(float(row["deviation"]), 2),
            }
            for _, row in grouped.iterrows()
        ]
    }


# --------------------------------------------------
# Retrain
# --------------------------------------------------

@app.post("/retrain")
def retrain():
    try:
        from ml.train import train
        train()
        return {"message": "Models retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))