from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Household(Base):
    __tablename__ = "households"

    household_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    household_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    created_by: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    members = relationship(
        "HouseholdMember",
        back_populates="household"
    )

    refrigerators = relationship(
        "Refrigerator",
        back_populates="household"
    )

    shopping_lists = relationship(
        "ShoppingList",
        back_populates="household"
    )