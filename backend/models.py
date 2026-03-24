from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import Base

# --- SQLAlchemy Models ---
class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(Text, nullable=False)
    status = Column(String, index=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- Pydantic Schemas ---
class CodeSubmission(BaseModel):
    code: str

class ErrorInsight(BaseModel):
    line: Optional[int] = None
    error_type: str
    error_message: str
    misconception: Optional[str] = None
    explanation: Optional[str] = None
    fix: Optional[str] = None
    practice: Optional[str] = None

class AnalysisResponse(BaseModel):
    status: str
    output: Optional[str] = None
    message: Optional[str] = None
    errors: list[ErrorInsight] = []

class SubmissionResponse(BaseModel):
    id: int
    code: str
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
