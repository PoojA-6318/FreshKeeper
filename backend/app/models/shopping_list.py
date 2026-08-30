from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    shopping_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    household_id: Mapped[int] = mapped_column(
        ForeignKey("households.household_id"),
        nullable=False
    )

    item_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    quantity: Mapped[float] = mapped_column(
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending"
    )

    household = relationship(
        "Household",
        back_populates="shopping_lists"
    )