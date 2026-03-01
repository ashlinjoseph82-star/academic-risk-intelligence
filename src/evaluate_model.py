import sqlite3
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

# --------------------------------------------------
# DATABASE PATH (FIXED)
# --------------------------------------------------
DB_PATH = "database/students.db"

# --------------------------------------------------
# FEATURE & TARGET COLUMNS
# --------------------------------------------------
FEATURE_COLS = [
    "pep_credits",
    "humanities_credits",
    "sip_credits",
    "short_iip_credits",
    "long_iip_credits",
    "effective_execution_credits",
    "total_credits",
    "year_of_study",
]

TARGET_COL = "degree_eligible"


# --------------------------------------------------
# DATA LOADING
# --------------------------------------------------
def load_data():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT * FROM students", conn)
    conn.close()
    return df


def prepare_data(df):
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]
    return train_test_split(X, y, test_size=0.25, random_state=42)


# --------------------------------------------------
# STREAMLIT-COMPATIBLE EVALUATION FUNCTION
# --------------------------------------------------
def evaluate_all_models():
    df = load_data()
    X_train, X_test, y_train, y_test = prepare_data(df)

    results = []

    # Decision Tree
    dt = DecisionTreeClassifier(random_state=42)
    dt.fit(X_train, y_train)
    dt_preds = dt.predict(X_test)

    results.append({
        "model": "Decision Tree",
        "accuracy": accuracy_score(y_test, dt_preds),
        "precision": precision_score(y_test, dt_preds, zero_division=0),
        "recall": recall_score(y_test, dt_preds, zero_division=0),
    })

    # Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)

    results.append({
        "model": "Random Forest",
        "accuracy": accuracy_score(y_test, rf_preds),
        "precision": precision_score(y_test, rf_preds, zero_division=0),
        "recall": recall_score(y_test, rf_preds, zero_division=0),
    })

    return results


# --------------------------------------------------
# CLI DEBUG MODE (OPTIONAL)
# --------------------------------------------------
def main():
    results = evaluate_all_models()
    for r in results:
        print(f"\n===== {r['model']} =====")
        print("Accuracy:", r["accuracy"])
        print("Precision:", r["precision"])
        print("Recall:", r["recall"])


if __name__ == "__main__":
    main()
