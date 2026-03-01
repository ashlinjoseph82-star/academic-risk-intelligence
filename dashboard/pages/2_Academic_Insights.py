import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="Academic Insights & Visualisations",
    layout="wide",
)

# ==================================================
# PAGE TITLE
# ==================================================
st.title(" Academic Insights & Visualisations")
st.caption(
    "Visual insights generated dynamically from data entered in the "
    "**Academic Progress Tracker**."
)

st.divider()

# ==================================================
# CHECK FOR DATA FROM PAGE 3
# ==================================================
required_keys = [
    "earned_inputs",
    "earned_total",
    "term_expected",
    "total_credits",
]

if not all(k in st.session_state for k in required_keys):
    st.warning(
        " No academic data found.\n\n"
        " Please enter your credits in **Academic Progress Tracker** first."
    )
    st.stop()

# ==================================================
# READ DATA FROM SESSION STATE
# ==================================================
earned_inputs = st.session_state["earned_inputs"]
earned_total = st.session_state["earned_total"]
TERM_EXPECTED = st.session_state["term_expected"]
TOTAL_CREDITS = st.session_state["total_credits"]

# ==================================================
# CREDIT DISTRIBUTION BY CATEGORY
# ==================================================
st.subheader(" Credit Distribution by Category")

experiential_total = (
    earned_inputs.get("SIP", 0)
    + earned_inputs.get("Short IIP", 0)
    + earned_inputs.get("Long IIP", 0)
    + earned_inputs.get("RI", 0)
)

category_df = pd.DataFrame({
    "Category": ["Core", "General Education", "Experiential"],
    "Credits Earned": [
        earned_inputs.get("Core", 0),
        earned_inputs.get("GE (Total)", 0),
        experiential_total,
    ],
})

c1, c2 = st.columns(2)

with c1:
    st.markdown("**Credits Earned by Category**")
    st.bar_chart(category_df.set_index("Category"))

with c2:
    st.markdown("**Credit Breakdown Table**")
    st.dataframe(category_df, use_container_width=True)

st.info(
    "This distribution highlights how credits are allocated across "
    "core academics, general education, and experiential learning."
)

st.divider()

# ==================================================
# REQUIRED VS EARNED COMPARISON
# ==================================================
st.subheader(" Required vs Earned Credits")

comparison_df = pd.DataFrame({
    "Type": ["Earned", "Remaining"],
    "Credits": [
        earned_total,
        max(0, TOTAL_CREDITS - earned_total),
    ],
})

st.bar_chart(comparison_df.set_index("Type"))

st.caption(
    "This comparison shows how far the student is from completing "
    "the total degree credit requirement."
)

st.divider()

# ==================================================
# TERM-WISE PROGRESS TREND
# ==================================================
st.subheader(" Term-wise Progress Trend")

term_df = pd.DataFrame({
    "Term": list(TERM_EXPECTED.keys()),
    "Expected Credits": list(TERM_EXPECTED.values()),
})

term_df["Your Earned Credits"] = earned_total

st.line_chart(term_df.set_index("Term"))

st.info(
    "If the earned credit line stays below the expected trajectory, "
    "it indicates a higher risk of delayed graduation."
)

st.divider()

# ==================================================
# INSIGHT SUMMARY
# ==================================================
st.subheader(" Key Insights")

st.write(
    """
    • Visualisations explain **why** a student may be at risk  
    • Category imbalance highlights **academic planning gaps**  
    • Term-wise trends support **early academic intervention**
    """
)

st.success(
    "These insights transform academic data into clear, actionable understanding."
)
