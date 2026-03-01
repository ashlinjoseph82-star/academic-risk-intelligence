import streamlit as st

# ==================================================
# PAGE CONFIG
# ==================================================
st.set_page_config(
    page_title="Academic Self-Audit System",
    layout="wide",
)

# ==================================================
# GLOBAL STYLES 
# ==================================================
st.markdown(
    """
    <style>
    /* ===============================
       SIDEBAR STYLING
    =============================== */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f172a, #020617);
        padding-top: 1.5rem;
    }

    section[data-testid="stSidebar"] * {
        color: #e5e7eb !important;
    }

    section[data-testid="stSidebar"] h1,
    section[data-testid="stSidebar"] h2,
    section[data-testid="stSidebar"] h3 {
        color: #ffffff !important;
        letter-spacing: 0.5px;
    }

    section[data-testid="stSidebar"] hr {
        border: none;
        height: 1px;
        background: linear-gradient(to right, #334155, transparent);
        margin: 1rem 0;
    }

    /* ===============================
       ROUNDED WIDGETS & CARDS
    =============================== */
    div[data-testid="stMetric"] {
        background-color: #0e1117;
        padding: 1rem;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.08);
    }

    div[data-testid="stMetric"] label {
        font-size: 0.85rem;
        opacity: 0.8;
    }

    div[data-testid="stMetricValue"] {
        font-size: 1.6rem;
        font-weight: 600;
    }

    /* Buttons */
    button[kind="primary"] {
        border-radius: 12px !important;
        padding: 0.5rem 1.2rem !important;
        font-weight: 600;
    }

    /* Selectbox / Number input */
    div[data-baseweb="select"],
    div[data-baseweb="input"] {
        border-radius: 12px !important;
    }

    /* Dataframe container */
    div[data-testid="stDataFrame"] {
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.08);
    }

    /* Main title */
    .main-title {
        font-size: 2.4rem;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    /* Highlight info box */
    .info-box {
        background: rgba(255,255,255,0.04);
        padding: 1.2rem;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.08);
    }
    </style>
    """,
    unsafe_allow_html=True
)

# ==================================================
# SIDEBAR CONTENT
# ==================================================
with st.sidebar:
    st.markdown("##  Academic Self-Audit")
    st.caption("Credit Eligibility & Risk Prediction")

    st.divider()

    st.markdown("###  Navigation")
    st.markdown(
        """
         **Model & Prediction Analysis**  
         **Academic Insights & Visualisations**  
         **Academic Progress Tracker**
        """
    )

    st.divider()

    st.markdown("### What This System Does")
    st.markdown(
        """
        - Tracks term-wise academic progress  
        - Identifies graduation eligibility risks  
        - Highlights credit distribution gaps  
        - Explains ML-based predictions  
        """
    )

    st.divider()

    st.markdown("### Tech Stack")
    st.markdown(
        """
        Python • Streamlit  
        SQLite • Scikit-learn  
        Rule-based + ML models
        """
    )

    st.divider()
    st.caption("Built for academic transparency & planning")

# ==================================================
# MAIN LANDING PAGE
# ==================================================
st.markdown(
    '<div class="main-title"> Academic Self-Audit & Risk Prediction System</div>',
    unsafe_allow_html=True
)

st.write(
    """
    This system enables **early academic self-evaluation** by combining
    **institutional academic rules** with **machine learning predictions**.

    Instead of discovering eligibility issues at the end of a degree,
    students can identify risks **early and take corrective action**.
    """
)

st.divider()

st.subheader(" Application Modules")

st.markdown(
    """
    **Model & Prediction Analysis**  
    Review trained machine learning models, compare accuracy, precision,
    and recall, and understand model selection decisions.

    **Academic Insights & Visualisations**  
    Explore interactive charts that reveal credit distribution,
    progress trends, and academic imbalances.

    **Academic Progress Tracker**  
    Enter academic data to evaluate eligibility, pending credits,
    and graduation risk in real time.
    """
)

st.divider()

st.markdown(
    """
    <div class="info-box">
         <b>Recommended Flow</b><br><br>
        1️ Enter data in <b>Academic Progress Tracker</b><br>
        2️ Analyse trends in <b>Academic Insights</b><br>
        3️ Validate predictions in <b>Model Analysis</b>
    </div>
    """,
    unsafe_allow_html=True
)
