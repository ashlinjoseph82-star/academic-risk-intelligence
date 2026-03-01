import sqlite3
import random
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "students.db"
SCHEMA_PATH = BASE_DIR / "database" / "schema.sql"

TOTAL_STUDENTS = 1000
TOTAL_TERMS = 8
TOTAL_REQUIRED_CREDITS = 160

def create_database():
    if DB_PATH.exists():
        DB_PATH.unlink()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    with open(SCHEMA_PATH, "r") as f:
        cursor.executescript(f.read())

    conn.commit()
    conn.close()

def generate_student():
    semester = random.randint(6, 10)  # some take longer

    core_credits = random.randint(60, 100)
    pep_credits = random.randint(8, 12)
    humanities_credits = random.randint(6, 12)

    internship_completed = random.choices([0, 1], weights=[0.3, 0.7])[0]
    failed_courses = random.randint(0, 5)

    total_credits = core_credits + pep_credits + humanities_credits
    if internship_completed:
        total_credits += 10

    expected_credits = int((TOTAL_REQUIRED_CREDITS / TOTAL_TERMS) * semester)
    deviation = total_credits - expected_credits

    # Graduation logic
    delayed = 0
    if semester > TOTAL_TERMS:
        delayed = 1
    if failed_courses >= 3:
        delayed = 1
    if deviation < -15:
        delayed = 1
    if internship_completed == 0 and semester >= 8:
        delayed = 1

    return (
        semester,
        core_credits,
        pep_credits,
        humanities_credits,
        internship_completed,
        failed_courses,
        total_credits,
        expected_credits,
        deviation,
        delayed,
    )

def populate_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    for _ in range(TOTAL_STUDENTS):
        student = generate_student()
        cursor.execute(
            """
            INSERT INTO students (
                semester,
                core_credits,
                pep_credits,
                humanities_credits,
                internship_completed,
                failed_courses,
                total_credits,
                expected_credits,
                deviation,
                graduation_outcome
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            student,
        )

    conn.commit()
    conn.close()

if __name__ == "__main__":
    print("Creating database...")
    create_database()
    print("Generating synthetic student data...")
    populate_database()
    print("Done. 1000 students inserted.")