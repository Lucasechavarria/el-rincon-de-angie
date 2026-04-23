"""Add database indexes for performance optimization"""

from sqlmodel import text
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def add_indexes():
    """Add indexes to improve query performance"""
    
    with engine.connect() as conn:
        # Index on Book.title for search performance
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_book_title ON book(title)"
            ))
            print("✓ Created index on Book.title")
        except Exception as e:
            print(f"✗ Error creating index on Book.title: {e}")
        
        # Index on Category.slug for filtering
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_category_slug ON category(slug)"
            ))
            print("✓ Created index on Category.slug")
        except Exception as e:
            print(f"✗ Error creating index on Category.slug: {e}")
        
        # Composite index on ReadingProgress(user_id, book_id)
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON readingprogress(user_id, book_id)"
            ))
            print("✓ Created composite index on ReadingProgress(user_id, book_id)")
        except Exception as e:
            print(f"✗ Error creating composite index on ReadingProgress: {e}")
        
        # Index on Analytics.event_date for reporting queries
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(event_date)"
            ))
            print("✓ Created index on Analytics.event_date")
        except Exception as e:
            print(f"✗ Error creating index on Analytics.event_date: {e}")
        
        # Index on Analytics.metric_type for filtering
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_analytics_metric_type ON analytics(metric_type)"
            ))
            print("✓ Created index on Analytics.metric_type")
        except Exception as e:
            print(f"✗ Error creating index on Analytics.metric_type: {e}")
        
        # Composite index on Analytics(event_date, metric_type)
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_analytics_date_metric ON analytics(event_date, metric_type)"
            ))
            print("✓ Created composite index on Analytics(event_date, metric_type)")
        except Exception as e:
            print(f"✗ Error creating composite index on Analytics: {e}")
        
        # Index on Payment.user_id for user payment history
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_payment_user_id ON payment(user_id)"
            ))
            print("✓ Created index on Payment.user_id")
        except Exception as e:
            print(f"✗ Error creating index on Payment.user_id: {e}")
        
        # Index on Payment.status for filtering
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status)"
            ))
            print("✓ Created index on Payment.status")
        except Exception as e:
            print(f"✗ Error creating index on Payment.status: {e}")
        
        # Index on Subscriber.is_active for filtering active subscribers
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_subscriber_active ON subscriber(is_active)"
            ))
            print("✓ Created index on Subscriber.is_active")
        except Exception as e:
            print(f"✗ Error creating index on Subscriber.is_active: {e}")
        
        conn.commit()
        print("\n✅ All indexes created successfully!")

if __name__ == "__main__":
    print("Adding database indexes for performance optimization...\n")
    add_indexes()
