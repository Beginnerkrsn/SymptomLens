from pathlib import Path
from tempfile import NamedTemporaryFile
import traceback

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.medical_report import MedicalReport
from app.models.user import User


router = APIRouter(
    prefix="/medical",
    tags=["Medical Analysis"],
)


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


MAX_FILE_SIZE = 10 * 1024 * 1024


def serialize_medical_report(report: MedicalReport) -> dict:
    return {
        "id": report.id,
        "user_id": report.user_id,
        "file_name": report.file_name,
        "report_type": report.report_type,
        "primary_specialty": report.primary_specialty,
        "routing_score_percentage": (
            report.routing_score_percentage
        ),
        "confidence_level": report.confidence_level,
        "specialties": report.specialties or [],
        "findings": report.findings or [],
        "measurements": report.measurements or [],
        "physicians": report.physicians or [],
        "status": report.status,
        "created_at": report.created_at,
    }


def run_medical_analysis(
    file_path: str,
    location: str | None,
    max_distance_km: float | None,
):
    from app.services.full_medical_analysis_service import (
        analyze_report_and_match_physicians,
    )

    return analyze_report_and_match_physicians(
        file_path=file_path,
        location=location,
        max_distance_km=max_distance_km,
        physician_limit=5,
    )


@router.post("/analyze")
async def analyze_medical_report(
    file: UploadFile = File(...),
    location: str | None = Form(None),
    distance: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Only PDF, JPG, JPEG and PNG "
                "files are allowed."
            ),
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must be 10 MB or less.",
        )

    max_distance_km = None

    if distance:
        try:
            max_distance_km = float(distance)
        except ValueError:
            max_distance_km = None

    temporary_path = None

    try:
        with NamedTemporaryFile(
            delete=False,
            suffix=extension,
        ) as temporary_file:
            temporary_file.write(contents)
            temporary_path = temporary_file.name

        result = await run_in_threadpool(
            run_medical_analysis,
            temporary_path,
            location,
            max_distance_km,
        )

        result["file_name"] = filename

        medical_report = MedicalReport(
            user_id=current_user.id,
            file_name=filename,
            report_type=result.get("report_type"),
            primary_specialty=result.get(
                "primary_specialty"
            ),
            routing_score_percentage=result.get(
                "routing_score_percentage"
            ),
            confidence_level=result.get(
                "confidence_level"
            ),
            specialties=result.get(
                "specialties",
                [],
            ),
            findings=result.get(
                "findings",
                [],
            ),
            measurements=result.get(
                "measurements",
                [],
            ),
            physicians=result.get(
                "physicians",
                [],
            ),
            status=result.get(
                "status",
                "success",
            ),
        )

        db.add(medical_report)

        try:
            db.commit()
            db.refresh(medical_report)
        except SQLAlchemyError:
            db.rollback()
            raise

        result["history_id"] = medical_report.id

        return result

    except HTTPException:
        raise

    except ValueError as exc:
        traceback.print_exc()

        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded medical report could not be "
                "processed. Please make sure the file contains "
                "readable medical information."
            ),
        ) from exc

    except RuntimeError as exc:
        traceback.print_exc()

        raise HTTPException(
            status_code=503,
            detail=(
                "Medical report processing is temporarily "
                "unavailable. Please try again after checking "
                "that the report is readable."
            ),
        ) from exc

    except SQLAlchemyError as exc:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=(
                "Medical report analysis completed, "
                "but the result could not be saved."
            ),
        ) from exc

    except Exception as exc:
        traceback.print_exc()

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Medical report analysis failed. "
                "Please try again with a valid PDF, JPG, "
                "JPEG or PNG medical report."
            ),
        ) from exc

    finally:
        if temporary_path:
            try:
                Path(temporary_path).unlink(
                    missing_ok=True
                )
            except Exception:
                pass


@router.get("/history")
def get_medical_report_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(MedicalReport)
        .filter(
            MedicalReport.user_id == current_user.id
        )
        .order_by(
            MedicalReport.created_at.desc()
        )
        .all()
    )

    return {
        "items": [
            serialize_medical_report(report)
            for report in reports
        ],
        "count": len(reports),
    }


@router.get("/history/{report_id}")
def get_medical_report_history_detail(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(MedicalReport)
        .filter(
            MedicalReport.id == report_id,
            MedicalReport.user_id == current_user.id,
        )
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Medical report not found.",
        )

    return serialize_medical_report(report)