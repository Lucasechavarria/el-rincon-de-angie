"""
Database configuration for Supabase PostgreSQL
"""
from sqlmodel import create_engine, Session
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Use Supabase PostgreSQL or fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")

# Create engine with proper configuration
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(
        DATABASE_URL,
        echo=True,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=5,
        max_overflow=10
    )
    print(f"[DATABASE] Connected to PostgreSQL (Supabase)")
else:
    # Fallback to SQLite for local development
    engine = create_engine(DATABASE_URL, echo=True)
    print(f"[DATABASE] Using SQLite: {DATABASE_URL}")

def get_session():
    with Session(engine) as session:
        yield session
