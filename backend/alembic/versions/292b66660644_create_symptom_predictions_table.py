"""create symptom predictions table

Revision ID: 292b66660644
Revises: 639c9c9e182f
Create Date: 2026-09-18 23:48:58.542996

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "292b66660644"
down_revision: Union[str, Sequence[str], None] = "639c9c9e182f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "symptom_predictions",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "input_text",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "top_condition",
            sa.String(length=150),
            nullable=True,
        ),
        sa.Column(
            "top_score",
            sa.Float(),
            nullable=True,
        ),
        sa.Column(
            "confidence_level",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "requires_review",
            sa.Boolean(),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "predictions",
            sa.JSON(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_symptom_predictions_user_created",
        "symptom_predictions",
        ["user_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        "ix_symptom_predictions_user_created",
        table_name="symptom_predictions",
    )

    op.drop_table(
        "symptom_predictions",
    )