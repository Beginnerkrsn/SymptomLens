from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SymptomPrediction(Base):
    __tablename__ = "symptom_predictions"

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

    input_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    top_condition: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    top_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    confidence_level: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="very_low",
    )

    requires_review: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="success",
    )

    predictions: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


Index(
    "ix_symptom_predictions_user_created",
    SymptomPrediction.user_id,
    SymptomPrediction.created_at,
)