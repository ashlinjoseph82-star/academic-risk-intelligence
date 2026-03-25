DROP TABLE IF EXISTS students;

CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Academic Progress
    term INTEGER,
    core_credits INTEGER,
    pep_credits INTEGER,
    humanities_credits INTEGER,
    total_credits INTEGER,
    expected_credits INTEGER,
    deviation INTEGER,

    -- Academic Behavior
    internship_completed INTEGER,
    failed_courses INTEGER,
    attendance_rate REAL,
    extracurricular_score INTEGER,

    -- Socioeconomic Factors
    family_income_level INTEGER,
    part_time_job INTEGER,
    scholarship INTEGER,
    campus_resident INTEGER,

    -- Psychological / Stress Factors
    stress_level INTEGER,

    -- Target
    graduation_outcome INTEGER
);