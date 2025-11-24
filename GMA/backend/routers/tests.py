from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from firebase_auth import get_current_user
from datetime import datetime
import json
import random

router = APIRouter(tags=["tests"])

async def get_doctor_id(
    user_token: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    firebase_uid = user_token.get("uid")
    doctor = db.query(models.Doctor).filter(
        models.Doctor.firebase_uid == firebase_uid
    ).first()
    
    # If doctor doesn't exist, create one
    if not doctor:
        print(f"Doctor not found for firebase_uid: {firebase_uid}, creating...")
        doctor = models.Doctor(
            firebase_uid=firebase_uid,
            email=user_token.get("email", ""),
            name=user_token.get("name", "")
        )
        db.add(doctor)
        db.commit()
        db.refresh(doctor)
        print(f"Doctor created: {doctor.id}")
    
    return doctor.id

def simulate_classification(video_id: int, video_filename: str) -> dict:
    """
    Simulate running classification on a video.
    In production, this would call the actual ML models.
    """
    # Simulate classification results
    math_score = random.randint(30, 95)
    dl_score = random.randint(30, 95)
    final_score = (math_score + dl_score) // 2
    
    return {
        "video_id": video_id,
        "video_filename": video_filename,
        "math_classifier": math_score,
        "dl_classifier": dl_score,
        "final_result": final_score,
        "status": "high-risk" if final_score >= 70 else "uncertain" if final_score >= 40 else "low-risk"
    }

@router.post("/instant")
async def create_instant_test(
    test_data: schemas.BlindTestCreate,
    doctor_id: int = Depends(get_doctor_id),
    db: Session = Depends(get_db)
):
    try:
        print(f"Creating instant test for doctor_id: {doctor_id}, videos: {test_data.video_ids}")
        
        # Validate video_ids is not empty
        if not test_data.video_ids or len(test_data.video_ids) == 0:
            print("Error: No video IDs provided")
            raise HTTPException(status_code=400, detail="No video IDs provided")
        
        # Fetch video details for the selected videos
        videos = db.query(models.VideoUpload).filter(
            models.VideoUpload.id.in_(test_data.video_ids),
            models.VideoUpload.doctor_id == doctor_id
        ).all()
        
        print(f"Found {len(videos)} videos for doctor_id {doctor_id}")
        
        if not videos:
            print(f"Error: No videos found for doctor_id {doctor_id} with ids {test_data.video_ids}")
            raise HTTPException(status_code=404, detail="No videos found")
        
        # Run classification on each video
        results = []
        for video in videos:
            classification = simulate_classification(video.id, video.original_filename)
            results.append(classification)
        
        print(f"Generated {len(results)} classifications")
        
        # Create test record with results
        blind_test = models.BlindTest(
            doctor_id=doctor_id,
            test_type="instant",
            status="completed",
            results=json.dumps(results),
            video_ids=json.dumps(test_data.video_ids)
        )
        db.add(blind_test)
        db.commit()
        db.refresh(blind_test)
        print(f"Test created: {blind_test.id}")
        return schemas.BlindTest.from_orm(blind_test)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating instant test: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating instant test: {str(e)}")

@router.post("/full")
async def create_full_test(
    test_data: schemas.BlindTestCreate,
    doctor_id: int = Depends(get_doctor_id),
    db: Session = Depends(get_db)
):
    try:
        print(f"Creating full test for doctor_id: {doctor_id}, videos: {test_data.video_ids}")
        
        # Validate video_ids is not empty
        if not test_data.video_ids or len(test_data.video_ids) == 0:
            print("Error: No video IDs provided")
            raise HTTPException(status_code=400, detail="No video IDs provided")
        
        # Fetch video details for the selected videos
        videos = db.query(models.VideoUpload).filter(
            models.VideoUpload.id.in_(test_data.video_ids),
            models.VideoUpload.doctor_id == doctor_id
        ).all()
        
        print(f"Found {len(videos)} videos for doctor_id {doctor_id}")
        
        if not videos:
            print(f"Error: No videos found for doctor_id {doctor_id} with ids {test_data.video_ids}")
            raise HTTPException(status_code=404, detail="No videos found")
        
        # Run classification on each video
        results = []
        for video in videos:
            classification = simulate_classification(video.id, video.original_filename)
            results.append(classification)
        
        print(f"Generated {len(results)} classifications")
        
        # Create test record with results
        blind_test = models.BlindTest(
            doctor_id=doctor_id,
            test_type="full",
            status="completed",
            results=json.dumps(results),
            video_ids=json.dumps(test_data.video_ids)
        )
        db.add(blind_test)
        db.commit()
        db.refresh(blind_test)
        print(f"Test created: {blind_test.id}")
        return schemas.BlindTest.from_orm(blind_test)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating full test: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating full test: {str(e)}")

@router.get("/history")
async def get_test_history(
    doctor_id: int = Depends(get_doctor_id),
    db: Session = Depends(get_db)
):
    tests = db.query(models.BlindTest).filter(
        models.BlindTest.doctor_id == doctor_id
    ).order_by(models.BlindTest.uploaded_at.desc()).all()
    
    return [schemas.BlindTest.from_orm(t) for t in tests]
