from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class ConsumptionHistory(Base):
    __tablename__ = "consumption_history"

    history_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    item_id: Mapped[int] = mapped_column(
        ForeignKey("inventory.item_id"),
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False
    )

    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    action_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    estimated_cost: Mapped[float | None] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )

    item = relationship(
        "Inventory",
        back_populates="consumption_history"
    )

    user = relationship(
        "User",
        foreign_keys=[user_id]
    )