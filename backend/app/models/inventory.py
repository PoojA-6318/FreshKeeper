from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    item_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    refrigerator_id: Mapped[int] = mapped_column(
        ForeignKey("refrigerators.refrigerator_id"),
        nullable=False
    )

    added_by: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False
    )

    item_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    item_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    category: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    unit: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    quantity: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    storage_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    date_added: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    expiry_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    estimated_price: Mapped[float | None] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    refrigerator = relationship(
        "Refrigerator",
        back_populates="inventory_items"
    )

    added_by_user = relationship(
        "User",
        foreign_keys=[added_by]
    )

    consumption_history = relationship(
        "ConsumptionHistory",
        back_populates="item"
    )

    notifications = relationship(
        "Notification",
        back_populates="item"
    )