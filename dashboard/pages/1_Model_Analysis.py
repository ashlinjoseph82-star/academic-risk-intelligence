import streamlit as st
import pandas as pd
import os
import sys

# --------------------------------------------------
# Ensure src imports work inside Streamlit
# --------------------------------------------------
sys.path.append(os.path.abspath("."))

# EDA + Evaluation Imports
from ml.eda import show_eda
from src.evaluate_model import evaluate_all_models

# NEW IMPORTS FOR CONFUSION MATRIX
from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from src.db_connection import load_student_data
from sklearn.model_selection import train_test_split

# ==================================================
# PAGE CONFIG
# ==================================================
st.set_page_config(
    page_title="Model & Prediction Analysis",
    layout="wide",
)

# ==================================================
# PAGE TITLE
# ==================================================
st.title(" Model & Prediction Analysis")
st.caption(
    "This page presents the machine learning models trained for graduation "
    "eligibility prediction and explains the final model selection."
)

st.divider()

# ==================================================
# PROBLEM CONTEXT
# ==================================================
st.subheader(" Problem Context")

st.write(
    """
    The objective of this project is to predict **graduation eligibility risk**
    based on academic credit patterns. Historical student data was used to train
    multiple traditional machine learning models, and their performance was
    evaluated on unseen test data before selecting a final model for deployment.
    """
)

st.divider()

# ==================================================
# MODELS TRAINED
# ==================================================
st.subheader(" Models Trained")

models_info = pd.DataFrame({
    "Model": [
        "Logistic Regression",
        "Decision Tree Classifier",
        "Random Forest Classifier"
    ],
    "Model Type": [
        "Linear Classification",
        "Tree-Based Classification",
        "Ensemble Tree-Based Classification"
    ],
    "Purpose": [
        "Baseline & interpretability",
        "Capture non-linear academic patterns",
        "Improve accuracy and generalization"
    ]
})

st.dataframe(models_info, use_container_width=True)

st.divider()

# ==================================================
# TRAINED MODEL FILES
# ==================================================
st.subheader(" Trained Models Available")

MODEL_DIR = "models"

if not os.path.exists(MODEL_DIR):
    st.error("Models directory not found.")
else:
    model_files = [f for f in os.listdir(MODEL_DIR) if f.endswith(".pkl")]

    if not model_files:
        st.warning("No trained model files found.")
    else:
        model_df = pd.DataFrame({
            "Model File": model_files,
            "Status": ["Ready for inference"] * len(model_files)
        })
        st.dataframe(model_df, use_container_width=True)

st.caption("All trained models are stored persistently and can be reused for inference.")

st.divider()

# ==================================================
# MODEL PERFORMANCE COMPARISON
# ==================================================
st.subheader(" Model Performance Comparison")

try:
    results = evaluate_all_models()
    performance_df = pd.DataFrame(results).round(3)

    styled_df = (
        performance_df
        .style
        .highlight_max(
            subset=["accuracy", "precision", "recall"],
            color="#22c55e"
        )
    )

    st.table(styled_df)

    best_model = performance_df.sort_values(
        by="accuracy", ascending=False
    ).iloc[0]

    st.caption(
        f"**{best_model['model']}** achieved the best overall test-set performance."
    )

except Exception as e:
    st.error("Failed to evaluate models.")
    st.code(str(e))
    st.stop()

st.divider()

# ==================================================
# VISUAL MODEL COMPARISON DASHBOARD
# ==================================================
st.subheader(" Visual Model Comparison Dashboard")

k1, k2, k3 = st.columns(3)
k1.metric(" Best Model", best_model["model"])
k2.metric("Accuracy", f"{best_model['accuracy']:.2f}")
k3.metric("Recall", f"{best_model['recall']:.2f}")

st.divider()

st.markdown("### Metric-wise Comparison Across Models")

chart_df = performance_df.set_index("model")[[
    "accuracy", "precision", "recall"
]]

st.bar_chart(chart_df, use_container_width=True)

st.caption(
    "Visual comparison of all trained models across Accuracy, Precision, "
    "and Recall to justify the final deployment decision."
)

st.divider()

# ==================================================
# MODEL SELECTION DECISION
# ==================================================
st.subheader(" Model Selected for Deployment")

st.success(
    f"""
    **{best_model['model']}** was selected as the deployed model due to
    superior test-set accuracy and a balanced precision–recall tradeoff.
    """
)

st.write(
    """
    Logistic Regression provided interpretability, and Decision Trees captured
    non-linear academic relationships. However, the Random Forest ensemble
    demonstrated stronger generalization by aggregating multiple decision trees.
    """
)

st.divider()

# ==================================================
# DEPLOYED MODEL METRICS
# ==================================================
st.subheader(" Deployed Model Performance")

c1, c2, c3 = st.columns(3)
c1.metric("Accuracy", f"{best_model['accuracy']:.2f}")
c2.metric("Precision", f"{best_model['precision']:.2f}")
c3.metric("Recall", f"{best_model['recall']:.2f}")

st.divider()

# ==================================================
# CONFUSION MATRIX (BEST MODEL)
# ==================================================
st.subheader(" Confusion Matrix (Best Model)")

try:
    df = load_student_data()

    X = df.drop(columns=[
        "student_id",
        "degree_eligible",
        "graduation_risk"
    ])
    y = df["degree_eligible"]

    X = pd.get_dummies(X, drop_first=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    best_model_filename = (
        best_model["model"].lower().replace(" ", "_") + ".pkl"
    )
    model_path = os.path.join("models", best_model_filename)

    loaded_model = joblib.load(model_path)

    y_pred = loaded_model.predict(X_test)

    cm = confusion_matrix(y_test, y_pred)

    fig, ax = plt.subplots()
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=["Predicted 0", "Predicted 1"],
        yticklabels=["Actual 0", "Actual 1"],
        ax=ax
    )

    ax.set_xlabel("Predicted Label")
    ax.set_ylabel("True Label")
    ax.set_title(f"Confusion Matrix - {best_model['model']}")

    st.pyplot(fig)

    st.caption(
        "The confusion matrix shows True Positives, True Negatives, "
        "False Positives, and False Negatives for the deployed model."
    )

except Exception as e:
    st.warning("Confusion matrix could not be generated.")
    st.code(str(e))

st.divider()

# ==================================================
# EXPLORATORY DATA ANALYSIS (EDA)
# ==================================================
st.subheader(" Exploratory Data Analysis")

st.caption(
    "This section provides insights into the dataset used for training the models, "
    "supporting feature selection and model design decisions."
)

try:
    show_eda()
except Exception as e:
    st.warning("EDA could not be loaded.")
    st.code(str(e))

st.divider()

# ==================================================
# DISCLAIMER
# ==================================================
st.subheader(" Important Note")

st.info(
    """
    Machine learning predictions are **advisory in nature** and are designed
    to complement official academic audits. This system functions as an
    early-warning tool to help students identify potential graduation risks
    well in advance.
    """
)
