import sqlite3
import pandas as pd
import joblib
import json
from pathlib import Path
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "students.db"
MODEL_DIR = BASE_DIR / "models"
METADATA_PATH = MODEL_DIR / "metadata.json"

MODEL_DIR.mkdir(exist_ok=True)


def load_data():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM students", conn)
    conn.close()
    return df


def get_next_version():
    if not METADATA_PATH.exists():
        return "v1"

    with open(METADATA_PATH, "r") as f:
        metadata = json.load(f)

    latest = metadata["latest_version"]
    number = int(latest.replace("v", ""))
    return f"v{number + 1}"


def train():
    print("Loading data...")
    df = load_data()

    # 🚨 REMOVE LEAKAGE COLUMNS
    X = df[[
        "semester",
        "core_credits",
        "pep_credits",
        "humanities_credits",
        "internship_completed",
        "failed_courses"
    ]]

    y = df["graduation_outcome"]

    numeric_cols = X.columns

    numeric_scaled = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    numeric_unscaled = Pipeline([
        ("imputer", SimpleImputer(strategy="median"))
    ])

    preprocessor_scaled = ColumnTransformer([
        ("num", numeric_scaled, numeric_cols)
    ])

    preprocessor_unscaled = ColumnTransformer([
        ("num", numeric_unscaled, numeric_cols)
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    models = {
        "logistic": Pipeline([
            ("preprocessor", preprocessor_scaled),
            ("classifier", LogisticRegression(max_iter=1000))
        ]),
        "decision_tree": Pipeline([
            ("preprocessor", preprocessor_unscaled),
            ("classifier", DecisionTreeClassifier(random_state=42))
        ]),
        "random_forest": Pipeline([
            ("preprocessor", preprocessor_unscaled),
            ("classifier", RandomForestClassifier(n_estimators=200, random_state=42))
        ]),
        "gradient_boosting": Pipeline([
            ("preprocessor", preprocessor_unscaled),
            ("classifier", GradientBoostingClassifier(random_state=42))
        ]),
        "xgboost": Pipeline([
            ("preprocessor", preprocessor_unscaled),
            ("classifier", XGBClassifier(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=5,
                random_state=42,
                eval_metric="logloss"
            ))
        ]),
    }

    version = get_next_version()
    version_dir = MODEL_DIR / version
    version_dir.mkdir(exist_ok=True)

    results = {}

    print("\nTraining models...\n")

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average="weighted")
        rec = recall_score(y_test, y_pred, average="weighted")
        f1 = f1_score(y_test, y_pred, average="weighted")

        joblib.dump(model, version_dir / f"{name}.pkl")

        results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
        }

        print(f"{name.upper()} → Acc:{acc:.4f}  F1:{f1:.4f}")

    metadata = {"latest_version": version, "history": [{
        "version": version,
        "models": results,
        "trained_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "dataset_size": len(df),
    }]}

    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=4)

    print(f"\nAll models saved under version {version}")


if __name__ == "__main__":
    train()