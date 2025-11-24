from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from firebase_auth import get_current_user

# routers/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from firebase_auth import get_current_user

router = APIRouter(tags=["auth"])

@router.post("/profile")
async def create_or_update_profile(
    user_data: schemas.DoctorCreate,
    user_token: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    firebase_uid = user_token.get("uid")
    
    # Check if doctor exists
    doctor = db.query(models.Doctor).filter(
        models.Doctor.firebase_uid == firebase_uid
    ).first()
    
    if doctor:
        # ✅ FIXED: Update both email and name fields
        doctor.email = user_data.email
        doctor.name = user_data.name # <-- Update Doctor name here!
    else:
        doctor = models.Doctor(
            firebase_uid=firebase_uid,
            email=user_data.email,
            name=user_data.name
        )
        db.add(doctor)
    
    db.commit()
    db.refresh(doctor)
    # The response now includes the updated database profile
    return doctor # FastAPI/Pydantic automatically uses schemas.Doctor.from_orm(doctor)

@router.get("/profile") # ADDED response_model for clarity

async def get_profile(
    user_token: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    firebase_uid = user_token.get("uid")
    doctor = db.query(models.Doctor).filter(
        models.Doctor.firebase_uid == firebase_uid
    ).first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    return schemas.Doctor.from_orm(doctor)
