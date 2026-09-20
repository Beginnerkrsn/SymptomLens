from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.xray_prediction import XrayPrediction
from app.services.xray_service import analyze_xray


router = APIRouter(prefix="/xray", tags=["Chest X-ray"])
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/analyze")
async def analyze_chest_xray(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG and PNG X-ray images are allowed.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded X-ray image is empty.")
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="X-ray image must be 10 MB or less.")

    try:
        result = analyze_xray(contents)
        record = XrayPrediction(
            user_id=current_user.id,
            file_name=file.filename or "xray-image",
            finding=result["finding"],
            score=result["score"],
            status="success",
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        result["history_id"] = record.id
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="X-ray result could not be saved.") from exc


@router.get("/history")
def get_xray_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(XrayPrediction)
        .filter(XrayPrediction.user_id == current_user.id)
        .order_by(XrayPrediction.created_at.desc())
        .all()
    )
    return {
        "items": [
            {
                "id": record.id,
                "file_name": record.file_name,
                "finding": record.finding,
                "score": record.score,
                "status": record.status,
                "created_at": record.created_at,
            }
            for record in records
        ],
        "count": len(records),
    }