import joblib
import json
import pandas as pd
from pathlib import Path

# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
METADATA_PATH = MODEL_DIR / "metadata.json"

# --------------------------------------------------
# Load latest models
# --------------------------------------------------

with open(METADATA_PATH) as f:
    metadata = json.load(f)

LATEST_VERSION = metadata["latest_version"]
VERSION_PATH = MODEL_DIR / LATEST_VERSION

models = {}

for file in VERSION_PATH.glob("*.pkl"):
    name = file.stem
    models[name] = joblib.load(file)

print("Loaded models:", list(models.keys()))

# --------------------------------------------------
# Prediction function
# --------------------------------------------------

def predict_student(data: dict):

    model_name = data.get("model", "logistic")

    if model_name not in models:
        model_name = "logistic"

    model = models[model_name]

    # --------------------------------------------------
    # Extract base inputs
    # --------------------------------------------------

    term = data.get("term", 1)
    failed_courses = data.get("failed_courses", 0)
    attendance_rate = data.get("attendance_rate", 0)
    stress_level = data.get("stress_level", 0)
    extracurricular_score = data.get("extracurricular_score", 0)

    internship_completed = data.get("internship_completed", 0)
    family_income_level = data.get("family_income_level", 2)
    part_time_job = data.get("part_time_job", 0)
    scholarship = data.get("scholarship", 0)
    campus_resident = data.get("campus_resident", 1)

    deviation = data.get("deviation", 0)

    # --------------------------------------------------
    # Academic pace
    # --------------------------------------------------

    earned = data.get("credits_earned", 0)

    expected = term * 10
    pace_gap = expected - earned

    credit_progress_ratio = earned / (expected + 1)

    # --------------------------------------------------
    # Feature engineering (must match training)
    # --------------------------------------------------

    academic_pressure = (
        failed_courses * 0.5 +
        stress_level * 0.3 +
        (1 - attendance_rate) * 2
    )

    engagement_score = (
        extracurricular_score * 0.4 +
        attendance_rate * 5
    )

    # --------------------------------------------------
    # Build ML feature dataframe
    # --------------------------------------------------

    ml_features = {
        "term": term,
        "failed_courses": failed_courses,
        "attendance_rate": attendance_rate,
        "stress_level": stress_level,
        "extracurricular_score": extracurricular_score,
        "academic_pressure": academic_pressure,
        "engagement_score": engagement_score,
        "deviation": deviation,
        "credit_progress_ratio": credit_progress_ratio,
        "internship_completed": internship_completed,
        "family_income_level": family_income_level,
        "part_time_job": part_time_job,
        "scholarship": scholarship,
        "campus_resident": campus_resident
    }

    df = pd.DataFrame([ml_features])

    # --------------------------------------------------
    # ML Prediction
    # --------------------------------------------------

    prediction = model.predict(df)[0]

    probs = model.predict_proba(df)[0]
    classes = list(model.classes_)

    if 1 in classes:
        delayed_index = classes.index(1)
    else:
        delayed_index = classes.index("Delayed")

    probability = float(probs[delayed_index])

    # --------------------------------------------------
    # Category Completion
    # --------------------------------------------------

    ge = data.get("ge_credits", 0)
    humanities = data.get("humanities_credits", 0)

    pep = data.get("pep_credits", 0)
    sip = data.get("sip_credits", 0)
    short_iip = data.get("short_iip_credits", 0)
    ri = data.get("ri_credits", 0)
    long_iip = data.get("long_iip_credits", 0)

    missing_components = []

    if ge < 32:
        missing_components.append("GE")

    if humanities < 8:
        missing_components.append("Humanities")

    if pep < 12:
        missing_components.append("PEP")

    if sip < 3:
        missing_components.append("SIP")

    if short_iip < 2:
        missing_components.append("Short IIP")

    if ri < 2:
        missing_components.append("RI")

    if long_iip < 10:
        missing_components.append("Long IIP")

    # --------------------------------------------------
    # Smart Risk Score
    # --------------------------------------------------

    rule_risk = 0

    rule_risk += max(0, pace_gap) * 0.6
    rule_risk += len(missing_components) * 10

    ml_risk = probability * 100

    combined_probability = (ml_risk * 0.7) + (rule_risk * 0.3)

    # --------------------------------------------------
    # Pace adjustment (NEW)
    # --------------------------------------------------

    if credit_progress_ratio > 1.3:
        combined_probability *= 0.35
    elif credit_progress_ratio > 1.1:
        combined_probability *= 0.55

    combined_probability = max(0, min(100, combined_probability))

    # --------------------------------------------------
    # Risk Level Logic
    # --------------------------------------------------

    if combined_probability > 60:
        risk_level = "High"
    elif combined_probability > 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # --------------------------------------------------
    # Return result
    # --------------------------------------------------

    return {
        "prediction": "Delayed" if prediction == 1 else "On-Time",
        "probability": round(combined_probability, 2),
        "risk_level": risk_level,
        "pace_gap": pace_gap,
        "missing_requirements": missing_components,
        "model_version": LATEST_VERSION,
        "model_used": model_name
    }