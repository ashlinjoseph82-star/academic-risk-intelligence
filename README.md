🎓 Smart System for Academic Progression Analysis and Graduation Delay Prediction
📸 Dashboard Preview
![alt text](<Graduation Tracker - Google Chrome 19-03-2026 21_58_17.png>) ![alt text](<Graduation Tracker - Google Chrome 18-03-2026 17_14_47.png>) ![alt text](<Graduation Tracker - Google Chrome 19-03-2026 21_56_36.png>) ![alt text](<Graduation Tracker - Google Chrome 19-03-2026 21_56_42.png>) ![alt text](<Graduation Tracker - Google Chrome 19-03-2026 21_56_51.png>) ![alt text](<Graduation Tracker - Google Chrome 19-03-2026 21_56_58.png>) ![alt text](<Graduation Tracker - Google Chrome 19-03-2026 21_57_07.png>) ![alt text](<Graduation Tracker - Google Chrome 19-03-2026 21_57_57.png>) ![alt text](<Graduation Tracker - Google Chrome 19-03-2026 21_58_02.png>) ![alt text](<Graduation Tracker - Google Chrome 19-03-2026 21_58_07.png>)
📌 Overview

This project is an intelligent academic analytics system designed to predict graduation delay risk based on student credit progression.

Unlike traditional rule-based systems that only check eligibility, this system goes a step further by using machine learning models to estimate risk probability, helping institutions and students take early corrective action.

🎯 Objectives
Determine whether a student is on track for graduation
Predict the probability of graduation delay
Classify students into Low / Medium / High risk
Provide early warning signals
Enable data-driven academic decisions
🧠 Key Idea

Instead of just answering:

❌ “Is the student eligible?”

We answer:

✅ “How likely is the student to face delay?”

This shift makes the system far more practical and impactful.

⚙️ System Architecture

The project follows a structured ML pipeline:

📊 Synthetic academic data generation
🗄️ SQLite database for structured storage
🔄 Data preprocessing & feature engineering
🤖 Training multiple ML models
📈 Model evaluation & comparison
🧾 Version-controlled model storage
⚡ FastAPI backend for predictions & retraining
💻 React dashboard for visualization
🔗 Full frontend-backend integration
🤖 Machine Learning Models

The system evaluates multiple traditional ML models:

Logistic Regression
Decision Tree
Random Forest
Extra Trees
Gradient Boosting
XGBoost
LightGBM
CatBoost
📊 Evaluation Metrics
Accuracy
Precision
Recall
F1 Score

👉 The best-performing model is automatically selected for predictions.

💻 Dashboard Features
📊 Category-wise credit analysis
⚠️ Internship & backlog indicators
📈 Model performance comparison
🔮 Graduation delay prediction
🎯 Risk level classification (Low / Medium / High)
🧾 Model version tracking
🧩 Project Structure
Backend/
│
├── ml/
│   ├── train.py
│   ├── retrain.py
│   ├── predict.py
│
├── models/
│   ├── v1, v2, v3...
│
├── main.py
├── requirements.txt

Frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│
├── public/
├── package.json
⚡ Tech Stack
🔙 Backend
Python
FastAPI
Scikit-learn
XGBoost, LightGBM, CatBoost
SQLite
🎨 Frontend
React (Vite + TypeScript)
Tailwind CSS
Recharts
🛠️ Tools
Git & GitHub
Modular architecture
Version-controlled ML lifecycle
🔌 API Endpoints
Method	Endpoint	Description
POST	/predict	Predict graduation delay risk
POST	/retrain	Retrain models with new data
GET	/models	Fetch model performance summary
🚀 Running the Project Locally
🔙 Backend
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
💻 Frontend
cd Frontend
npm install
npm run dev
🧠 Use Cases
🎓 University academic monitoring systems
📊 Student performance dashboards
⚠️ Early warning systems for at-risk students
🧾 Academic advisory tools
🔮 Future Improvements
Integration with real-world university data
Advanced models (Deep Learning)
Real-time analytics dashboards
Cloud deployment (AWS / Render)
Role-based admin/student access
🏆 Why This Project Stands Out
Combines ML + Full Stack Development
Focuses on real-world academic problems
Uses multiple model comparison
Implements model versioning
Provides actionable insights, not just predictions
👨‍💻 Author

Ashlin Joseph

⭐ Final Note

This project demonstrates how machine learning can move beyond static rules and become a decision-support system that provides meaningful, real-world impact.

🚀

If you like this project, consider giving it a ⭐ on GitHub!