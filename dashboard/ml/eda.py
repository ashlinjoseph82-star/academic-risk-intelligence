import streamlit as st
import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

# ==================================================
# DATABASE CONNECTION (FIXED)
# ==================================================
DB_PATH = "database/students.db"


def load_data():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT * FROM students", conn)
    conn.close()
    return df


# ==================================================
# MAIN EDA FUNCTION
# ==================================================
def show_eda():
    st.subheader("Exploratory Data Analysis (EDA)")

    df = load_data()

    if df.empty:
        st.warning("No data found in the database.")
        return

    # ==================================================
    # DATA OVERVIEW
    # ==================================================
    st.markdown("### Dataset Overview")
    st.dataframe(df.head(), use_container_width=True)

    st.markdown(
        f"""
        **Total Records:** {len(df)}  
        **Total Features:** {df.shape[1]}
        """
    )

    st.divider()

    # ==================================================
    # TARGET DISTRIBUTION
    # ==================================================
    st.markdown("### Graduation Eligibility Distribution")

    fig, ax = plt.subplots()
    df["degree_eligible"].value_counts().plot(
        kind="bar",
        ax=ax
    )
    ax.set_xlabel("Eligibility (0 = Not Eligible, 1 = Eligible)")
    ax.set_ylabel("Number of Students")

    st.pyplot(fig)

    st.info(
        "This plot shows the distribution of students who are currently "
        "eligible vs not eligible for graduation. Class balance affects "
        "model performance and evaluation metrics."
    )

    st.divider()

    # ==================================================
    # CREDIT DISTRIBUTION
    # ==================================================
    st.markdown("### Credit Distribution")

    credit_cols = [
        "pep_credits",
        "humanities_credits",
        "sip_credits",
        "short_iip_credits",
        "long_iip_credits",
        "effective_execution_credits",
        "total_credits",
    ]

    fig, ax = plt.subplots(figsize=(8, 4))
    df[credit_cols].boxplot(ax=ax)
    ax.set_ylabel("Credits")
    ax.set_title("Distribution of Academic Credits")

    st.pyplot(fig)

    st.info(
        "Boxplots highlight variability and outliers in academic credit "
        "categories, which can strongly influence graduation eligibility."
    )

    st.divider()

    # ==================================================
    # CORRELATION ANALYSIS
    # ==================================================
    st.markdown("### 🔗 Feature Correlation")

    numeric_df = df[credit_cols + ["year_of_study", "degree_eligible"]]

    fig, ax = plt.subplots(figsize=(8, 5))
    im = ax.imshow(numeric_df.corr(), cmap="coolwarm")

    ax.set_xticks(range(len(numeric_df.columns)))
    ax.set_yticks(range(len(numeric_df.columns)))
    ax.set_xticklabels(numeric_df.columns, rotation=45, ha="right")
    ax.set_yticklabels(numeric_df.columns)

    fig.colorbar(im, ax=ax)
    ax.set_title("Correlation Between Numeric Features")

    st.pyplot(fig)

    st.info(
        "Correlation analysis helps identify which academic factors "
        "are most strongly associated with graduation eligibility."
    )

    # ==================================================
    # EDA SUMMARY
    # ==================================================
    st.success(
        """
        **EDA Summary**
        - Reviewed dataset structure and size  
        - Analysed graduation eligibility distribution  
        - Identified variability in academic credit categories  
        - Examined correlations to justify feature selection  

        These insights support the design and evaluation of the prediction models.
        """
    )
