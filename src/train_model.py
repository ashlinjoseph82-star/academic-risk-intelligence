import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

from src.db_connection import load_student_data


# ==================================================
# DATA PREPARATION
# ==================================================
def prepare_data():
    df = load_student_data()

    X = df.drop(columns=[
        "student_id",
        "degree_eligible",
        "graduation_risk"
    ])

    y = df["degree_eligible"]

    # One-hot encode categorical features
    X = pd.get_dummies(X, drop_first=True)

    return train_test_split(
        X, y, test_size=0.2, random_state=42
    )


# ==================================================
# MODEL TRAINING + PICKLING
# ==================================================
def train_models():
    X_train, X_test, y_train, y_test = prepare_data()

    print("\nClass distribution in training data:")
    print(y_train.value_counts())

    # Ensure models directory exists
    os.makedirs("models", exist_ok=True)

    models = {
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(
            n_estimators=100, random_state=42
        )
    }

    # Train Logistic Regression ONLY if both classes exist
    if y_train.nunique() > 1:
        models["Logistic Regression"] = LogisticRegression(max_iter=1000)
    else:
        print("Skipping Logistic Regression (only one class present)")

    print("\n Training Models...\n")

    for name, model in models.items():
        model.fit(X_train, y_train)

        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)

        print(f" {name} Accuracy: {acc:.2f}")

        # Save (pickle) model
        file_name = name.lower().replace(" ", "_") + ".pkl"
        joblib.dump(model, f"models/{file_name}")

        print(f" Saved: models/{file_name}\n")


# ==================================================
# ENTRY POINT
# ==================================================
if __name__ == "__main__":
    train_models()
