import json
import re
import os
from typing import Optional

# Load misconceptions once at startup
MISCONCEPTIONS_FILE = os.path.join(os.path.dirname(__file__), 'misconceptions.json')

try:
    with open(MISCONCEPTIONS_FILE, 'r') as f:
        misconceptions_db = json.load(f)
except FileNotFoundError:
    print(f"Warning: {MISCONCEPTIONS_FILE} not found. Rule-based matching disabled.")
    misconceptions_db = []

def match_error(error_type: str, error_message: str) -> Optional[dict]:
    """
    Attempts to match the given error against the known misconceptions database
    using regex patterns.
    """
    if not isinstance(error_message, str):
        error_message = str(error_message)
    if not isinstance(error_type, str):
        error_type = str(error_type)
        
    full_error = f"{error_type}: {error_message}"
    
    for item in misconceptions_db:
        pattern = item.get("error_pattern", "")
        try:
            if re.search(pattern, full_error):
                return item
        except re.error:
            # Skip invalid regex patterns in the DB
            continue
            
    return None
