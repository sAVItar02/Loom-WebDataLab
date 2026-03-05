"""add page_name to scraped pages

Revision ID: b3a1f4d9e2c7
Revises: 9e7b4ab1c2d3
Create Date: 2026-03-01 00:00:01.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b3a1f4d9e2c7"
down_revision: Union[str, Sequence[str], None] = "9e7b4ab1c2d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("scraped_pages", sa.Column("page_name", sa.String(), nullable=True))
    op.execute("UPDATE scraped_pages SET page_name = url WHERE page_name IS NULL")
    op.alter_column("scraped_pages", "page_name", nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("scraped_pages", "page_name")
