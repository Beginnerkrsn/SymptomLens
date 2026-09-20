"""create xray predictions table

Revision ID: b6a2f5e9c1d4
Revises: afd30727384d
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b6a2f5e9c1d4"
down_revision: Union[str, Sequence[str], None] = "afd30727384d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "xray_predictions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("finding", sa.String(length=100), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_xray_predictions_user_created",
        "xray_predictions",
        ["user_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_xray_predictions_user_created", table_name="xray_predictions")
    op.drop_table("xray_predictions")