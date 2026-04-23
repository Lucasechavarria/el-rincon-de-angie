"""
Test direct connection to Supabase PostgreSQL
"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("=" * 60)
print("Testing Direct PostgreSQL Connection")
print("=" * 60)
print(f"\nDATABASE_URL: {DATABASE_URL[:50]}...")

try:
    print("\nAttempting to connect...")
    conn = psycopg2.connect(DATABASE_URL)
    print("✅ Connection successful!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"\nPostgreSQL version: {version[0]}")
    
    cursor.close()
    conn.close()
    print("\n✅ Connection closed successfully")
    
except psycopg2.OperationalError as e:
    print(f"\n❌ Connection failed: {e}")
    print("\nPossible causes:")
    print("1. Firewall blocking port 5432")
    print("2. DNS not resolving db.zwhhzqffzedwsqhzingq.supabase.co")
    print("3. Incorrect password")
    print("4. Network connectivity issues")
    
except Exception as e:
    print(f"\n❌ Unexpected error: {e}")
