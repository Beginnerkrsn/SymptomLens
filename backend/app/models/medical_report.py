from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    JSON,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    report_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    primary_specialty: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    routing_score_percentage: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    confidence_level: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    specialties: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )

    findings: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )

    measurements: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )

    physicians: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="success",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


Index(
    "ix_medical_reports_user_created",
    MedicalReport.user_id,
    MedicalReport.created_at,
)