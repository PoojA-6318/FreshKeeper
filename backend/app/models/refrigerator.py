from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Refrigerator(Base):
    __tablename__ = "refrigerators"

    refrigerator_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    household_id: Mapped[int] = mapped_column(
        ForeignKey("households.household_id"),
        nullable=False
    )

    refrigerator_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    storage_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="refrigerator"
    )

    location: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    household = relationship(
        "Household",
        back_populates="refrigerators"
    )

    inventory_items = relationship(
        "Inventory",
        back_populates="refrigerator"
    )