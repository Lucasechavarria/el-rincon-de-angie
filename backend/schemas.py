from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    email: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

# Book Schemas
class BookBase(BaseModel):
    title: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    price: float
    preview_percentage: float = 0.1

class BookCreate(BookBase):
    file_path: str # This will be handled internally or via upload

class BookUpdate(BookBase):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    price: Optional[float] = None
    preview_percentage: Optional[float] = None
    file_path: Optional[str] = None

class BookResponse(BookBase):
    id: int
    file_path: str
    created_at: datetime
    author_id: Optional[int] = None
    class Config:
        from_attributes = True

# Token Schema for authentication
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# User Profile Schemas
class UserProfileBase(BaseModel):
    email: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Transaction/Payment Response for user history
class TransactionResponse(BaseModel):
    id: int
    book_id: int
    book_title: str
    amount: float
    status: str
    payment_method: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
