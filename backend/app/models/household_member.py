from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class HouseholdMember(Base):
    __tablename__ = "household_members"

    member_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False
    )

    household_id: Mapped[int] = mapped_column(
        ForeignKey("households.household_id"),
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    joined_on: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="household_memberships"
    )

    household = relationship(
        "Household",
        back_populates="members"
    )