from sqlalchemy import Column, Integer, String, DateTime, Enum, func
from sqlalchemy.orm import declarative_base
from enum import Enum as PyEnum

from .base import Base

class CommentType(PyEnum): # ended up not using, could develop later
    GENERAL = "GENERAL"
    QUESTION = "QUESTION"
    FEEDBACK = "FEEDBACK"

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    commenter = Column(String, nullable=False)
    comment_type = Column(Enum(CommentType), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

