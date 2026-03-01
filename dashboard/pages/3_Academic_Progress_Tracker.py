import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="Academic Progress Tracker",
    layout="wide",
)

# ==================================================
# PAGE TITLE
# ==================================================
st.title(" Academic Progress Tracker")
st.caption(
    "Track your academic standing in real time using term-wise progress "
    "and official degree credit requirements."
)

st.divider()

# ==================================================
# DEGREE CONFIGURATION (TERM-BASED)
# ==================================================
DEGREE_CONFIG = {
    "B.Tech / TSM (4 Years)": {"credits": 160, "years": 4},
    "BBA (3 Years)": {"credits": 120, "years": 3},
    "Law (5 Years)": {"credits": 200, "years": 5},
}

TERMS_PER_YEAR = 4

degree = st.selectbox(
    " Select Degree Program",
    list(DEGREE_CONFIG.keys())
)

TOTAL_CREDITS = DEGREE_CONFIG[degree]["credits"]
TOTAL_YEARS = DEGREE_CONFIG[degree]["years"]
TOTAL_TERMS = TOTAL_YEARS * TERMS_PER_YEAR

TERM_EXPECTED = {
    term: int((TOTAL_CREDITS / TOTAL_TERMS) * term)
    for term in range(1, TOTAL_TERMS + 1)
}

st.caption(
    f"{degree} • {TOTAL_YEARS} Years • {TOTAL_TERMS} Terms • {TOTAL_CREDITS} Credits"
)

st.divider()

# ==================================================
# CREDIT RULES
# ==================================================
CREDIT_RULES = {
    "Core": {"required": int(TOTAL_CREDITS * 0.57), "unlock_term": 1},
    "PEP": {"required": 12, "unlock_term": 1, "lock_after_term": 6},
    "GE (Total)": {"required": 32, "unlock_term": 1},
    "Humanities": {"required": 8, "unlock_term": 1},
    "Effective Execution": {"required": 3, "unlock_term": 1},
    "SIP": {"required": 3, "unlock_term": 5},
    "Short IIP": {"required": 2, "unlock_term": 9},
    "Long IIP": {"required": 10, "unlock_term": 13},
    "RI": {"required": 4, "unlock_term": 9},
}

# ==================================================
# ACADEMIC POSITION
# ==================================================
st.subheader("Current Academic Position")

col1, col2 = st.columns(2)

with col1:
    term = st.selectbox(
        "Current Term",
        list(range(1, TOTAL_TERMS + 1))
    )

with col2:
    st.markdown(
        f"**Academic Phase:** "
        f"{'Final Phase' if term >= TOTAL_TERMS - 2 else 'Mid Phase' if term >= 5 else 'Early Phase'}"
    )

st.divider()

# ==================================================
# CREDIT INPUTS (CORE UNCAPPED)
# ==================================================
st.subheader(" Credits Earned So Far")

# -------- ROW 1 --------
r1c1, r1c2, r1c3 = st.columns(3)

with r1c1:
    core = st.number_input(
        "Core Credits",
        min_value=0,
        max_value=300,   # intentionally high → no artificial cap
        value=0,
        step=1
    )

with r1c2:
    humanities = st.number_input("Humanities Credits (GE)", 0, 8, 0)

with r1c3:
    sip = st.number_input("SIP Credits", 0, 3, 0)

# -------- ROW 2 --------
r2c1, r2c2, r2c3 = st.columns(3)

with r2c1:
    pep = st.number_input("PEP Credits", 0, 12, 0)

with r2c2:
    other_ge = st.number_input("Other GE Credits", 0, 24, 0)

with r2c3:
    short_iip = st.number_input("Short IIP Credits", 0, 2, 0)

# -------- ROW 3 --------
r3c1, r3c2, r3c3 = st.columns(3)

with r3c1:
    execution = st.number_input("Effective Execution Credits", 0, 3, 0)

with r3c2:
    ri = st.number_input("RI (Research Incubation) Credits", 0, 4, 0)

with r3c3:
    long_iip = st.number_input("Long IIP Credits", 0, 10, 0)

ge_total = humanities + other_ge

earned_inputs = {
    "Core": core,
    "PEP": pep,
    "GE (Total)": ge_total,
    "Humanities": humanities,
    "Effective Execution": execution,
    "SIP": sip,
    "Short IIP": short_iip,
    "Long IIP": long_iip,
    "RI": ri,
}

st.divider()

# ==================================================
# EVALUATION LOGIC
# ==================================================
rows = []
earned_total = 0
pending = 0
future_locked = 0
missing = []

for cat, rule in CREDIT_RULES.items():
    earned = earned_inputs.get(cat, 0)
    required = rule["required"]

    available = term >= rule["unlock_term"]
    if "lock_after_term" in rule and term > rule["lock_after_term"]:
        available = False

    if available:
        earned_total += earned
        deficit = max(0, required - earned)

        if deficit > 0:
            pending += deficit
            missing.append(cat)

        status = "Completed" if earned >= required else "Pending"
        progress = int((earned / required) * 100)
        remaining = deficit
    else:
        future_locked += required
        status = "Not Available "
        progress = "-"
        remaining = "-"

    rows.append([cat, required, earned, remaining, progress, status])

expected_by_now = TERM_EXPECTED[term]
performance_ratio = earned_total / max(expected_by_now, 1)

if performance_ratio >= 1:
    academic_status, risk, color = "Eligible / On Track", "Low", "success"
elif performance_ratio >= 0.85:
    academic_status, risk, color = "On Track (Pending)", "Low", "info"
elif performance_ratio >= 0.7:
    academic_status, risk, color = "Attention Needed", "Medium", "warning"
else:
    academic_status, risk, color = "At Risk", "High", "error"

# ==================================================
# SAVE TO SESSION (FOR PAGE 2)
# ==================================================
st.session_state["earned_inputs"] = earned_inputs
st.session_state["earned_total"] = earned_total
st.session_state["term"] = term
st.session_state["term_expected"] = TERM_EXPECTED
st.session_state["total_credits"] = TOTAL_CREDITS

# ==================================================
# STATUS OUTPUT
# ==================================================
getattr(st, color)(
    f"**{academic_status}**  \nCredits Earned: {earned_total} / {expected_by_now}"
)

st.progress(min(earned_total / TOTAL_CREDITS, 1.0))

st.subheader("Graduation Risk")
st.markdown(
    f"### {'🟢 Low Risk' if risk=='Low' else '🟡 Medium Risk' if risk=='Medium' else '🔴 High Risk'}"
)

st.divider()

# ==================================================
# SUMMARY METRICS
# ==================================================
c1, c2, c3, c4 = st.columns(4)
c1.metric("Credits Earned", earned_total)
c2.metric("Expected by Now", expected_by_now)
c3.metric("Pending Credits", pending)
c4.metric("Future Locked", future_locked)

# ==================================================
# CREDIT TABLE
# ==================================================
st.subheader(" Credit Breakdown")

df = pd.DataFrame(
    rows,
    columns=["Category", "Required", "Earned", "Remaining", "Progress %", "Status"]
)

st.dataframe(df, use_container_width=True)

# ==================================================
# MISSING REQUIREMENTS
# ==================================================
if missing:
    st.warning("### Missing / Incomplete Requirements")
    for m in missing:
        st.write("•", m)

st.info(
    "This tracker supports early academic planning using term-based progress evaluation."
)
