from sqlalchemy import Boolean, Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    role = Column(String, default="Doctor") # Keep this
    created_at = Column(DateTime, default=datetime.utcnow) # Keep this
    # REMOVED: Duplicate created_at = Column(DateTime, default=datetime.utcnow)

    uploads = relationship("VideoUpload", back_populates="doctor")
    tests = relationship("BlindTest", back_populates="doctor")

class VideoUpload(Base):
    __tablename__ = "uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    filename = Column(String)
    original_filename = Column(String)
    file_path = Column(String)
    file_size = Column(Float)  # in bytes
    upload_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="uploaded")  # uploaded, processing, completed, error
    
    doctor = relationship("Doctor", back_populates="uploads")

class BlindTest(Base):
    __tablename__ = "blind_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    test_type = Column(String)  # instant or full
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")  # pending, completed, error
    results = Column(String, nullable=True)  # JSON string with classification results
    video_ids = Column(String, nullable=True)  # JSON array of video IDs used in test
    
    doctor = relationship("Doctor", back_populates="tests")

