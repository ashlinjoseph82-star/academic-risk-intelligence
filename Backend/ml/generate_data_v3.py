import sqlite3
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# 🔥 NEW DATABASE (v3)
DB_PATH = BASE_DIR / "database" / "students_v3.db"
SCHEMA_PATH = BASE_DIR / "database" / "schema.sql"

TOTAL_STUDENTS = 15000
TOTAL_REQUIRED_CREDITS = 160

DEGREE_OPTIONS = [12, 16, 20]


# --------------------------------------------------
# CREATE DATABASE (FRESH V3)
# --------------------------------------------------

def create_database():
    if DB_PATH.exists():
        print("⚠️ students_v3.db already exists. Deleting...")
        DB_PATH.unlink()

    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"Schema not found: {SCHEMA_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    with open(SCHEMA_PATH, "r") as f:
        cursor.executescript(f.read())

    conn.commit()
    conn.close()


# --------------------------------------------------
# GENERATE STUDENT
# --------------------------------------------------

def generate_student():

    degree_terms = random.choice(DEGREE_OPTIONS)
    term = random.randint(1, degree_terms)

    core_credits = random.randint(20, 130)
    pep_credits = random.randint(3, 18)
    humanities_credits = random.randint(3, 18)

    internship_completed = random.choices([0, 1], weights=[0.4, 0.6])[0]
    failed_courses = random.randint(0, 7)

    attendance_rate = round(random.uniform(0.45, 0.98), 2)

    family_income_level = random.choice([1, 2, 3])
    part_time_job = random.choice([0, 1])

    extracurricular_score = random.randint(0, 12)

    stress_level = random.choices(
        [1,2,3,4,5,6,7,8,9,10],
        weights=[2,3,5,7,9,9,7,5,3,2]
    )[0]

    scholarship = random.choice([0, 1])
    campus_resident = random.choice([0, 1])

    total_credits = core_credits + pep_credits + humanities_credits

    if internship_completed:
        total_credits += 10

    expected_credits = int((TOTAL_REQUIRED_CREDITS / degree_terms) * term)
    deviation = total_credits - expected_credits

    # Risk logic
    risk_score = 0

    if failed_courses >= 3:
        risk_score += 2

    if attendance_rate < 0.65:
        risk_score += 2
    elif attendance_rate < 0.75:
        risk_score += 1

    if deviation < -25:
        risk_score += 2
    elif deviation < -10:
        risk_score += 1

    if stress_level > 7:
        risk_score += 1

    if extracurricular_score < 2 and attendance_rate < 0.7:
        risk_score += 1

    if part_time_job and attendance_rate < 0.7:
        risk_score += 1

    if internship_completed == 0 and term >= degree_terms - 2:
        risk_score += 1

    if scholarship == 1 and failed_courses == 0:
        risk_score -= 1

    risk_score += random.uniform(-1.2, 1.2)

    delay_probability = min(max(risk_score * 0.12, 0.05), 0.9)

    delayed = 1 if random.random() < delay_probability else 0

    if random.random() < 0.05:
        delayed = 1 - delayed

    return (
        term,
        core_credits,
        pep_credits,
        humanities_credits,
        internship_completed,
        failed_courses,
        total_credits,
        expected_credits,
        deviation,
        attendance_rate,
        extracurricular_score,
        family_income_level,
        part_time_job,
        scholarship,
        campus_resident,
        stress_level,
        delayed,
    )


# --------------------------------------------------
# POPULATE DB
# --------------------------------------------------

def populate_database():

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    for i in range(TOTAL_STUDENTS):

        cursor.execute(
            """
            INSERT INTO students (
                term,
                core_credits,
                pep_credits,
                humanities_credits,
                internship_completed,
                failed_courses,
                total_credits,
                expected_credits,
                deviation,
                attendance_rate,
                extracurricular_score,
                family_income_level,
                part_time_job,
                scholarship,
                campus_resident,
                stress_level,
                graduation_outcome
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            generate_student(),
        )

        if (i + 1) % 3000 == 0:
            print(f"Inserted {i+1} students...")

    conn.commit()
    conn.close()


# --------------------------------------------------
# MAIN
# --------------------------------------------------

if __name__ == "__main__":

    print("🚀 Creating students_v3.db...")

    create_database()

    print("📊 Generating 15,000 students...")

    populate_database()

    print("✅ Done. students_v3.db ready!")