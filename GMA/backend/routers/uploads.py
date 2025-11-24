from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from firebase_auth import get_current_user
from config import settings
import os
from datetime import datetime

router = APIRouter(tags=["uploads"])

# Create uploads directory if not exists
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)

async def get_doctor_id(
    user_token: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    firebase_uid = user_token.get("uid")
    doctor = db.query(models.Doctor).filter(
        models.Doctor.firebase_uid == firebase_uid
    ).first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    return doctor.id
@router.get("/", )
async def get_all_uploads(
    doctor_id: int = Depends(get_doctor_id),
    db: Session = Depends(get_db)
):
    """
    Retrieve all video uploads for the current authenticated doctor.
    """
    # Query all uploads for the doctor, ordered by most recent first
    videos = db.query(models.VideoUpload).filter(
        models.VideoUpload.doctor_id == doctor_id
    ).order_by(models.VideoUpload.upload_time.desc()).all()
    
    return videos

@router.post("/")
async def upload_videos(
    files: list[UploadFile] = File(...),
    doctor_id: int = Depends(get_doctor_id),
    db: Session = Depends(get_db)
):
    uploaded_videos = []
    
    for file in files:
        # Check file type
        if not file.filename.lower().endswith(('.mov', '.mp4')):
            raise HTTPException(
                status_code=400, 
                detail=f"Only .mov or .mp4 files allowed: {file.filename}"
            )

        # Generate safe filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(settings.UPLOADS_DIR, safe_filename)

        try:
            # Write file in chunks to handle large files
            file_size = 0
            with open(file_path, "wb") as buffer:
                while chunk := await file.read(1024 * 1024):  # 1MB chunks
                    file_size += len(chunk)
                    
                    # Check file size limit
                    if file_size > settings.MAX_FILE_SIZE:
                        # Clean up partial file
                        buffer.close()
                        if os.path.exists(file_path):
                            os.remove(file_path)
                        raise HTTPException(
                            status_code=413,
                            detail=f"File too large: {file.filename} (max {settings.MAX_FILE_SIZE / 1_000_000_000}GB)"
                        )
                    
                    buffer.write(chunk)
                
        except HTTPException:
            raise
        except Exception as e:
            # Clean up on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=500, 
                detail=f"File write error: {str(e)}"
            )

        # Save to database
        db_video = models.VideoUpload(
            doctor_id=doctor_id,
            filename=safe_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            status="uploaded"
        )
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        uploaded_videos.append(db_video)

    return uploaded_videos

@router.get("/history")
async def get_upload_history(
    doctor_id: int = Depends(get_doctor_id),
    db: Session = Depends(get_db)
):
    videos = db.query(models.VideoUpload).filter(
        models.VideoUpload.doctor_id == doctor_id
    ).order_by(models.VideoUpload.uploaded_at.desc()).all()
    
    return [schemas.VideoUpload.from_orm(v) for v in videos]

@router.delete("/{upload_id}")
async def delete_upload(
    upload_id: int,
    doctor_id: int = Depends(get_doctor_id),
    db: Session = Depends(get_db)
):
    video = db.query(models.VideoUpload).filter(
        models.VideoUpload.id == upload_id,
        models.VideoUpload.doctor_id == doctor_id
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Delete file from disk
    if os.path.exists(video.file_path):
        os.remove(video.file_path)
    
    # Delete from database
    db.delete(video)
    db.commit()
    
    return {"message": "Video deleted successfully"}

@router.put("/{upload_id}")
async def update_upload(
    upload_id: int,
    update_data: dict,
    doctor_id: int = Depends(get_doctor_id),
    db: Session = Depends(get_db)
):
    video = db.query(models.VideoUpload).filter(
        models.VideoUpload.id == upload_id,
        models.VideoUpload.doctor_id == doctor_id
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if "filename" in update_data:
        video.filename = update_data["filename"]
    
    db.commit()
    db.refresh(video)
    
    return schemas.VideoUpload.from_orm(video)

@router.get("/{upload_id}/download")
async def download_video(
    upload_id: int,
    doctor_id: int = Depends(get_doctor_id),
    db: Session = Depends(get_db)
):
    """
    Download a video file with proper Content-Disposition header.
    """
    video = db.query(models.VideoUpload).filter(
        models.VideoUpload.id == upload_id,
        models.VideoUpload.doctor_id == doctor_id
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if not os.path.exists(video.file_path):
        raise HTTPException(status_code=404, detail="Video file not found on disk")
    
    return FileResponse(
        path=video.file_path,
        media_type='video/mp4',
        filename=video.original_filename,
        headers={"Content-Disposition": f"attachment; filename={video.original_filename}"}
    )