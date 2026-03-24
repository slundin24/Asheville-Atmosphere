from datetime import datetime
from pydantic import BaseModel, EmailStr
from models import CommentType
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr
    first_name: str
    last_name: str


class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel): # added 2/22 for extra security
    id: str
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    role: str

    class Config:
        from_attributes = True


class CommentBase(BaseModel):
    """Base schema with common fields for comments"""

    # commenter: str
    text: str
    comment_type: CommentType


class CommentCreate(CommentBase):
    """Schema for creating new comments"""

    pass


class CommentUpdate(BaseModel):
    """Schema for updating a comment - all fields optional"""

    # commenter: Optional[str] = None
    text: Optional[str] = None
    comment_type: Optional[CommentType] = None


class CommentResponse(CommentBase):
    """What a comment looks like when we send it back to the client"""

    id: int
    commenter: str
    timestamp: datetime

    # This tells Pydantic to automatically convert SQLAlchemy models
    # (like our Todo model) into this Pydantic model
    class Config:
        from_attributes = True
