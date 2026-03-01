import sqlite3
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

DB_PATH = "students.db"

# =============================
# DEGREE CONFIG (used for risk)
# =============================
DEGREE_REQUIREMENTS = {
    "BTECH_AI": 160,
    "TSM": 160,
    "BBA": 120,
    "BBA_LLB": 200,
}

# =============================
# ACADEMIC TIME RULES
# =============================
def academic_time_violations(
    degree_years,
    current_year,
    pep,
    sip,
    short_iip,
    long_iip,
):
    violations = []

    # PEP: only first 1.5 years
    if current_year > 2 and pep > 0:
        violations.append("PEP credits are only allowed in the first 1.5 years")

    # SIP: after 1st year
    if current_year < 2 and sip > 0:
        violations.append("SIP can only be completed after 1st year")

    # Short IIP: after 2nd year
    if current_year < 3 and short_iip > 0:
        violations.append("Short IIP can only be completed after 2nd year")

    # Long IIP: final 6 months
    if current_year < degree_years and long_iip > 0:
        violations.append("Long IIP is only allowed in the final 6 months")

    return violations


# =============================
# DATABASE
# =============================
def load_data():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT * FROM students", conn)
    conn.close()
    return df


# =============================
# MODEL
# =============================
def train_model(df):
    features = [
        "pep_credits",
        "humanities_credits",
        "sip_credits",
        "short_iip_credits",
        "long_iip_credits",
        "effective_execution_credits",
        "total_credits",
        "year_of_study",
    ]

    X = df[features]
    y = df["degree_eligible"]

    model = DecisionTreeClassifier(
        max_depth=6,
        random_state=42
    )
    model.fit(X, y)

    return model, features


# =============================
# PREDICTION
# =============================
def predict_student(model, features, student):
    student_df = pd.DataFrame([student])[features]
    prediction = model.predict(student_df)[0]
    return "ELIGIBLE" if prediction == 1 else "NOT ELIGIBLE"


def calculate_risk(total_credits, required_credits, eligible):
    if eligible == "ELIGIBLE":
        return "Low"

    progress = total_credits / required_credits

    if progress >= 0.7:
        return "Medium"
    return "High"


# =============================
# MAIN
# =============================
def main():
    df = load_data()
    model, features = train_model(df)

    # -----------------------------
    # MANUAL STUDENT INPUT
    # -----------------------------
    student = {
        "degree_program": "BTECH_AI",
        "degree_years": 4,
        "year_of_study": 3,

        "pep_credits": 10,
        "humanities_credits": 6,
        "sip_credits": 2,
        "short_iip_credits": 1,
        "long_iip_credits": 0,
        "effective_execution_credits": 3,
    }

    student["total_credits"] = (
        student["pep_credits"]
        + student["humanities_credits"]
        + student["sip_credits"]
        + student["short_iip_credits"]
        + student["long_iip_credits"]
        + student["effective_execution_credits"]
        + 70  # academic/core credits
    )

    # =============================
    # TIME VALIDATION FIRST
    # =============================
    violations = academic_time_violations(
        degree_years=student["degree_years"],
        current_year=student["year_of_study"],
        pep=student["pep_credits"],
        sip=student["sip_credits"],
        short_iip=student["short_iip_credits"],
        long_iip=student["long_iip_credits"],
    )

    print("\n===== STUDENT PREDICTION =====")

    if violations:
        print("Status: NOT DEGREE ELIGIBLE (TIME RESTRICTED)")
        print("Reason(s):")
        for v in violations:
            print("-", v)

        print("Graduation Risk: NORMAL FOR CURRENT STAGE")
        return

    # =============================
    # ML PREDICTION
    # =============================
    eligibility = predict_student(
        model,
        features,
        student
    )

    required = DEGREE_REQUIREMENTS[student["degree_program"]]
    risk = calculate_risk(
        total_credits=student["total_credits"],
        required_credits=required,
        eligible=eligibility,
    )

    print("Degree Eligibility:", eligibility)
    print("Graduation Risk:", risk)


if __name__ == "__main__":
    main()
