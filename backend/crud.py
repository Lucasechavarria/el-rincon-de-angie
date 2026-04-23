from typing import List, Optional
from datetime import date, datetime
from sqlmodel import Session, select
from models import User, Book, Category, Analytics, Subscriber, EmailLog, ReadingProgress, Bookmark
from schemas import UserCreate, BookCreate, BookUpdate
from auth import get_password_hash
import json

def create_user(session: Session, user_create: UserCreate) -> User:
    from models import UserProfile
    hashed_password = get_password_hash(user_create.password)
    user = User(username=user_create.username, hashed_password=hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Create profile
    profile = UserProfile(user_id=user.id, email=user_create.email)
    session.add(profile)
    session.commit()
    
    return user

def get_user_by_username(session: Session, username: str) -> Optional[User]:
    return session.exec(select(User).where(User.username == username)).first()

def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
    return session.get(User, user_id)

def create_book(session: Session, book_create: BookCreate, author_id: int) -> Book:
    book = Book(**book_create.dict(), author_id=author_id)
    session.add(book)
    session.commit()
    session.refresh(book)
    return book

def get_books(session: Session, offset: int = 0, limit: int = 100) -> List[Book]:
    return session.exec(select(Book).offset(offset).limit(limit)).all()

def get_book_by_id(session: Session, book_id: int) -> Optional[Book]:
    return session.get(Book, book_id)

def update_book(session: Session, book_id: int, book_update: BookUpdate) -> Optional[Book]:
    book = session.get(Book, book_id)
    if not book:
        return None
    
    update_data = book_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(book, key, value)
    
    session.add(book)
    session.commit()
    session.refresh(book)
    return book

def delete_book(session: Session, book_id: int) -> Optional[Book]:
    book = session.get(Book, book_id)
    if not book:
        return None
    session.delete(book)
    session.commit()
    return book

def create_analytics_event(session: Session, metric_type: str, value: float = 1.0, book_id: Optional[int] = None, data_json: Optional[str] = None):
    event = Analytics(
        event_date=date.today(),
        metric_type=metric_type,
        value=value,
        book_id=book_id,
        data_json=data_json
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event

# Reading Progress Operations
def get_reading_progress(session: Session, user_id: int, book_id: int):
    """Get reading progress for a user and book"""
    statement = select(ReadingProgress).where(
        ReadingProgress.user_id == user_id,
        ReadingProgress.book_id == book_id
    )
    return session.exec(statement).first()

def update_reading_progress(session: Session, user_id: int, book_id: int, current_page: int):
    """Update or create reading progress"""
    progress = get_reading_progress(session, user_id, book_id)
    
    if progress:
        progress.current_page = current_page
        progress.last_read = datetime.utcnow()
    else:
        progress = ReadingProgress(
            user_id=user_id,
            book_id=book_id,
            current_page=current_page,
            last_read=datetime.utcnow()
        )
        session.add(progress)
    
    session.commit()
    session.refresh(progress)
    return progress

# Bookmark Operations
def get_bookmarks(session: Session, user_id: int, book_id: int):
    """Get all bookmarks for a user and book"""
    statement = select(Bookmark).where(
        Bookmark.user_id == user_id,
        Bookmark.book_id == book_id
    ).order_by(Bookmark.page_number)
    return session.exec(statement).all()

def create_bookmark(session: Session, user_id: int, book_id: int, page_number: int, note: Optional[str] = None):
    """Create a new bookmark"""
    bookmark = Bookmark(
        user_id=user_id,
        book_id=book_id,
        page_number=page_number,
        note=note,
        created_at=datetime.utcnow()
    )
    session.add(bookmark)
    session.commit()
    session.refresh(bookmark)
    return bookmark

def delete_bookmark(session: Session, bookmark_id: int, user_id: int):
    """Delete a bookmark (only if it belongs to the user)"""
    statement = select(Bookmark).where(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == user_id
    )
    bookmark = session.exec(statement).first()
    if bookmark:
        session.delete(bookmark)
        session.commit()
        return True
    return False