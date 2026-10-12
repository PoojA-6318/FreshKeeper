
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import SessionLocal
from ..models.shopping_list import ShoppingList
from ..models.household import Household

router = APIRouter(
    prefix="/shopping-list",
    tags=["Shopping List"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ShoppingItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    quantity: float = Field(default=1, gt=0)


class ShoppingItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    quantity: float | None = Field(default=None, gt=0)


def get_user_households(db: Session, user_id: int):
    return db.query(Household).filter(
        Household.created_by == user_id
    )


def get_shopping_item(
    db: Session,
    shopping_id: int,
    user_id: int,
):
    return (
        db.query(ShoppingList)
        .join(
            Household,
            ShoppingList.household_id == Household.household_id,
        )
        .filter(
            ShoppingList.shopping_id == shopping_id,
            Household.created_by == user_id,
        )
        .first()
    )


def serialize_item(item: ShoppingList):
    return {
        "shopping_id": item.shopping_id,
        "name": item.item_name,
        "quantity": item.quantity,
        "is_purchased": item.status == "purchased",
        "status": item.status,
        "household_id": item.household_id,
    }


@router.get("")
def list_shopping_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = (
        db.query(ShoppingList)
        .join(
            Household,
            ShoppingList.household_id == Household.household_id,
        )
        .filter(Household.created_by == current_user.user_id)
        .order_by(ShoppingList.shopping_id.desc())
        .all()
    )

    return [serialize_item(item) for item in items]


@router.post("")
def create_shopping_item(
    data: ShoppingItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    household = get_user_households(
        db, current_user.user_id
    ).first()

    if not household:
        raise HTTPException(
            status_code=400,
            detail="Create a household before adding shopping items",
        )

    name = data.name.strip()
    if not name:
        raise HTTPException(
            status_code=422,
            detail="Item name cannot be empty",
        )

    item = ShoppingList(
        household_id=household.household_id,
        item_name=name,
        quantity=data.quantity,
        status="pending",
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return serialize_item(item)


@router.put("/{shopping_id}")
def update_shopping_item(
    shopping_id: int,
    data: ShoppingItemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = get_shopping_item(
        db, shopping_id, current_user.user_id
    )

    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")

    updates = data.model_dump(exclude_unset=True)

    if "name" in updates:
        name = updates["name"].strip() if updates["name"] else ""
        if not name:
            raise HTTPException(
                status_code=422,
                detail="Item name cannot be empty",
            )
        item.item_name = name

    if updates.get("quantity") is not None:
        item.quantity = updates["quantity"]

    db.commit()
    db.refresh(item)

    return serialize_item(item)


@router.patch("/{shopping_id}/purchased")
def toggle_purchased(
    shopping_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = get_shopping_item(
        db, shopping_id, current_user.user_id
    )

    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")

    item.status = (
        "pending" if item.status == "purchased" else "purchased"
    )

    db.commit()
    db.refresh(item)

    return serialize_item(item)


@router.delete("/{shopping_id}")
def delete_shopping_item(
    shopping_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = get_shopping_item(
        db, shopping_id, current_user.user_id
    )

    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")

    db.delete(item)
    db.commit()

    return {"message": "Shopping item deleted successfully"}
