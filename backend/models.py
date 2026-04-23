from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
import enum
from datetime import datetime, date
import uuid

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    is_admin: bool = Field(default=False)

    books: List["Book"] = Relationship(back_populates="author")
    profile: Optional["UserProfile"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    reading_progress: List["ReadingProgress"] = Relationship(back_populates="user")
    bookmarks: List["Bookmark"] = Relationship(back_populates="user")


class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    email: Optional[str] = Field(default=None, index=True)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: Optional[User] = Relationship(back_populates="profile")

# Link table for Book-Category many-to-many relationship
class BookCategory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    book_id: int = Field(foreign_key="book.id")
    category_id: int = Field(foreign_key="category.id")


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    slug: str = Field(unique=True, index=True)
    description: Optional[str] = None
    icon: Optional[str] = None  # Icon name from lucide-react
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    books: List["Book"] = Relationship(back_populates="categories", link_model=BookCategory)


class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    file_path: str  # Local path (legacy) or Supabase path
    storage_path: Optional[str] = None  # Supabase Storage path in 'originals' bucket
    preview_path: Optional[str] = None  # Supabase Storage path in 'previews' bucket
    price: float = Field(default=0.0, index=True)
    preview_percentage: float = Field(default=0.1)  # Percentage of the book available for preview
    preview_pages: int = Field(default=5)  # Number of pages in preview
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)

    author_id: Optional[int] = Field(default=None, foreign_key="user.id")
    author: Optional[User] = Relationship(back_populates="books")
    categories: List[Category] = Relationship(back_populates="books", link_model=BookCategory)
    reading_progress: List["ReadingProgress"] = Relationship(back_populates="book")
    bookmarks: List["Bookmark"] = Relationship(back_populates="book")


class ReadingProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    book_id: int = Field(foreign_key="book.id", index=True)
    current_page: int = Field(default=1)
    total_pages: int
    last_read_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: Optional[User] = Relationship(back_populates="reading_progress")
    book: Optional[Book] = Relationship(back_populates="reading_progress")


class Bookmark(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    book_id: int = Field(foreign_key="book.id", index=True)
    page_number: int
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: Optional[User] = Relationship(back_populates="bookmarks")
    book: Optional[Book] = Relationship(back_populates="bookmarks")

class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    book_id: int = Field(foreign_key="book.id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    guest_email: Optional[str] = Field(default=None, index=True)
    amount: float
    status: str  # e.g., "completed", "pending", "failed"
    transaction_id: Optional[str] = Field(default=None, unique=True, index=True)  # Mercado Pago payment ID
    payment_method: Optional[str] = None  # e.g., "credit_card", "debit_card"
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    payment_date: datetime = Field(default_factory=datetime.utcnow, nullable=False)  # Keep for backwards compatibility

class Download(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    book_id: int = Field(foreign_key="book.id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    guest_email: Optional[str] = Field(default=None, index=True)
    file_path: Optional[str] = None  # Path to the watermarked file
    delivery_id: Optional[str] = None  # UUID of the delivery in Supabase Storage
    downloaded_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    download_date: datetime = Field(default_factory=datetime.utcnow, nullable=False)  # Keep for backwards compatibility

class DownloadEvent(SQLModel, table=True):
    """Traceability table for all download events"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    guest_email: Optional[str] = Field(default=None, index=True)
    book_id: int = Field(foreign_key="book.id")
    payment_id: Optional[int] = Field(default=None, foreign_key="payment.id")
    delivery_id: str = Field(index=True)  # UUID of the delivery
    watermark_hash: str = Field(index=True)  # SHA256 of the delivered file
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_fingerprint: Optional[str] = None
    downloaded_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


# Analytics Models
class Analytics(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_date: date = Field(index=True)
    metric_type: str = Field(index=True)  # 'sale', 'preview', 'registration'
    book_id: Optional[int] = Field(default=None, foreign_key="book.id")
    value: float
    data_json: Optional[str] = Field(default=None)  # JSON string for additional data


# Newsletter Models
class Subscriber(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    is_active: bool = Field(default=True)
    subscribed_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    unsubscribe_token: str = Field(unique=True, default_factory=lambda: str(uuid.uuid4()))


class EmailTemplate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    subject: str
    html_content: str
    text_content: str
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class EmailLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    recipient: str = Field(index=True)
    template_name: str
    status: str = Field(index=True)  # 'sent', 'failed', 'pending'
    sent_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    error_message: Optional[str] = None


# Author Page Models
class AuthorInfo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    bio: str
    photo_url: Optional[str] = None
    # Social media fields (will be added but not displayed in UI per user request)
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    email: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class Timeline(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    year: int
    title: str
    description: str
    book_id: Optional[int] = Field(default=None, foreign_key="book.id")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
