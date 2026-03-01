-- Student Academic Records Schema

CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    degree_program TEXT NOT NULL,
    year_of_study INTEGER NOT NULL,

    pep_credits INTEGER DEFAULT 0,
    humanities_credits INTEGER DEFAULT 0,
    sip_credits INTEGER DEFAULT 0,
    short_iip_credits INTEGER DEFAULT 0,
    long_iip_credits INTEGER DEFAULT 0,
    core_credits INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);