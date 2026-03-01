# ==================================================
# PROJECT CONFIGURATION FILE
# ==================================================

import os

# Base directory of the project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Database configuration
DB_NAME = "students.db"
DB_PATH = os.path.join(BASE_DIR, DB_NAME)

# Models directory
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Random state for reproducibility
RANDOM_STATE = 42