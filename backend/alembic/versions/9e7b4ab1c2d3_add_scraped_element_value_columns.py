"""add scraped element value columns

Revision ID: 9e7b4ab1c2d3
Revises: 14cb4e59f010
Create Date: 2026-03-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9e7b4ab1c2d3"
down_revision: Union[str, Sequence[str], None] = "14cb4e59f010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("scraped_elements", sa.Column("detected_type", sa.String(), nullable=True))
    op.add_column("scraped_elements", sa.Column("numeric_value", sa.Float(), nullable=True))
    op.add_column("scraped_elements", sa.Column("date_value", sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("scraped_elements", "date_value")
    op.drop_column("scraped_elements", "numeric_value")
    op.drop_column("scraped_elements", "detected_type")
