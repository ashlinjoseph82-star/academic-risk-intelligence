import sqlite3
import pandas as pd
from pathlib import Path

# ==================================================
# DATABASE PATH (ABSOLUTE & SAFE)
# ==================================================
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "students.db"

def load_student_data():
    """
    Load student data from SQLite database into a pandas DataFrame
    """
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM students", conn)
    conn.close()
    return df
