from sqlmodel import Session, create_engine, select
from models import User
from auth import get_password_hash
from database import engine

def reset_admin():
    with Session(engine) as session:
        statement = select(User).where(User.username == "admin")
        admin = session.exec(statement).first()
        
        if admin:
            print("Found admin user. Resetting password to 'admin123'...")
            admin.hashed_password = get_password_hash("admin123")
            session.add(admin)
            session.commit()
            print("Password reset successful. New credentials: admin / admin123")
        else:
            print("Admin user not found in database.")

if __name__ == "__main__":
    reset_admin()
