# Credit Completion & Degree Eligibility Prediction System

This project predicts degree eligibility and graduation risk for university students based on category-wise credit completion under a credit-based academic structure.

The system is designed as an academic decision-support tool that reflects how universities evaluate student progress. It focuses on identifying potential graduation risks early, without penalizing students for credits that are not yet available according to academic timelines.

---

## Project Objectives

- Assess whether a student is currently on track for graduation  
- Identify graduation risk levels (Low, Medium, High)  
- Provide early warnings based on academic credit patterns  
- Support students and administrators with data-driven insights  

---

## System Overview

The project follows a production-style machine learning workflow, including:

- Synthetic academic data generation  
- SQL-based data storage  
- Training and evaluation of traditional machine learning models  
- Model comparison and selection  
- Prediction-ready inference pipeline  
- Interactive Streamlit dashboard for analysis and predictions  
- Version-controlled development lifecycle  

---

## Machine Learning Models

The following models were trained and evaluated:

- **Logistic Regression** – baseline model with interpretability  
- **Decision Tree** – captures non-linear academic patterns  
- **Random Forest** – selected as the final deployed model  

The Random Forest classifier was chosen due to its stronger performance across accuracy, precision, and recall, as well as its robustness and generalization ability.

---

## Dashboard Features

The interactive dashboard allows users to:

- View academic credit summaries  
- Compare model performance metrics  
- Explore data through visual analysis  
- Generate graduation eligibility predictions  
- Understand graduation risk levels at different academic stages  

---

## Technology Stack

- Python  
- Streamlit  
- Pandas and NumPy  
- Scikit-learn  
- Matplotlib and Seaborn  
- SQLite  
- Git and GitHub  

---

## Running the Project Locally

```bash
git clone https://github.com/<your-username>/credit-eligibility-prediction.git
cd credit-eligibility-prediction
python -m pip install -r requirements.txt
streamlit run dashboard/app.py

---

## Project Status
Model training and evaluation completed

Dashboard implementation finalized

Prediction pipeline ready for use

Repository version-controlled and reproducible
