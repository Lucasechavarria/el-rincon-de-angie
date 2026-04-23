import sys
import os

print("--- Running test_import.py ---")
print(f"CWD: {os.getcwd()}")
print(f"sys.path: {sys.path}")

try:
    print("Attempting to import 'database'...")
    import database
    print("Successfully imported 'database' module.")
    print(f"database module found at: {database.__file__}")
except Exception as e:
    print(f"!!! FAILED to import 'database': {e}")
    import traceback
    traceback.print_exc()

print("--- Finished test_import.py ---")
