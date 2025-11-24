from pydantic import BaseModel, Field 
from datetime import datetime
from typing import Optional

class DoctorCreate(BaseModel):
    email: str
    name: Optional[str] = None

class Doctor(BaseModel):
    id: int
    firebase_uid: str
    email: str
    name: Optional[str]
    role: str # ADDED: Include the role field
    created_at: datetime # ADDED: Include the created_at timestamp
    
    class Config:
        from_attributes = True

class VideoUploadCreate(BaseModel):
    filename: str
    file_size: float

class VideoUpload(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: float
    created_at: datetime = Field(alias='upload_time')
    status: str
    
    class Config:
        from_attributes = True
# schemas.py (Conceptual addition)

class SettingsBase(BaseModel):
    email_notifications: bool
    push_notifications: bool
    auto_save_reports: bool
    dark_mode: bool

class SettingsCreate(SettingsBase):
    pass

class Settings(SettingsBase):
    id: int
    doctor_id: int
    
    class Config:
        from_attributes = True

class BlindTestCreate(BaseModel):
    test_type: str
    video_ids: list[int]

class BlindTest(BaseModel):
    id: int
    test_type: str
    uploaded_at: datetime
    status: str
    results: Optional[str] = None
    video_ids: Optional[str] = None
    
    class Config:
        from_attributes = True