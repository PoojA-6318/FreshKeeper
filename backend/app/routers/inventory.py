from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..auth import get_current_user
from ..database import SessionLocal
from ..models.inventory import Inventory
from ..models.refrigerator import Refrigerator
from ..schemas.inventory import InventoryCreate, InventoryResponse
from ..models.household import Household
from ..models.consumption_history import ConsumptionHistory
from datetime import date, datetime, timedelta

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def inventory_to_response(item: Inventory) -> dict:
    return {
        "item_id": item.item_id,
        "refrigerator_id": item.refrigerator_id,
        "refrigerator_name": item.refrigerator.refrigerator_name,
        "added_by": item.added_by,
        "item_name": item.item_name,
        "item_type": item.item_type,
        "category": item.category,
        "unit": item.unit,
        "quantity": item.quantity,
        "storage_type": item.storage_type,
        "date_added": item.date_added,
        "expiry_date": item.expiry_date,
        "is_homemade": item.is_homemade,
        "cooked_date": item.cooked_date,
        "shelf_life_days": item.shelf_life_days,
        "storage_information": item.storage_information,
        "image_url": item.image_url,
        "estimated_price": item.estimated_price,
        "notes": item.notes,
        "status": item.status,
    }


@router.post(
    "",
    response_model=InventoryResponse,
    status_code=201
)
def create_inventory_item(
    item_data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    refrigerator = (
        db.query(Refrigerator)
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Refrigerator.refrigerator_id == item_data.refrigerator_id,
            Household.created_by == current_user.user_id
        )
        .first()
    )

    if not refrigerator:
        raise HTTPException(
            status_code=404,
            detail="Refrigerator not found"
        )

    inventory_item = Inventory(
        refrigerator_id=item_data.refrigerator_id,
        added_by=current_user.user_id,
        item_name=item_data.item_name,
        item_type=item_data.item_type,
        category=item_data.category,
        unit=item_data.unit,
        quantity=item_data.quantity,
        storage_type=item_data.storage_type,
        date_added=item_data.date_added,
        expiry_date=item_data.expiry_date,
        image_url=item_data.image_url,
        estimated_price=item_data.estimated_price,
        notes=item_data.notes
    )

    db.add(inventory_item)
    db.commit()
    db.refresh(inventory_item)

    return inventory_to_response(inventory_item)

@router.get(
    "",
    response_model=list[InventoryResponse]
)
def get_inventory_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inventory_items = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id
            == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id
            == Household.household_id
        )
        .filter(
            Household.created_by == current_user.user_id,
            Inventory.status == "active"
        )
        .all()
    )

    return [inventory_to_response(item) for item in inventory_items]

@router.post("/{item_id}/consume")
def consume_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inventory_item = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Inventory.item_id == item_id,
            Household.created_by == current_user.user_id,
            Inventory.status == "active"
        )
        .first()
    )

    if not inventory_item:
        raise HTTPException(
            status_code=404,
            detail="Active inventory item not found"
        )

    history = ConsumptionHistory(
        item_id=inventory_item.item_id,
        user_id=current_user.user_id,
        action="consumed",
        action_date=datetime.utcnow(),
        estimated_cost=inventory_item.estimated_price
    )

    inventory_item.status = "consumed"

    db.add(history)
    db.commit()

    return {
        "message": "Inventory item marked as consumed",
        "item_id": inventory_item.item_id,
        "status": inventory_item.status
    }

@router.post("/{item_id}/discard")
def discard_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inventory_item = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Inventory.item_id == item_id,
            Household.created_by == current_user.user_id,
            Inventory.status == "active"
        )
        .first()
    )

    if not inventory_item:
        raise HTTPException(
            status_code=404,
            detail="Active inventory item not found"
        )

    history = ConsumptionHistory(
        item_id=inventory_item.item_id,
        user_id=current_user.user_id,
        action="discarded",
        action_date=datetime.utcnow(),
        estimated_cost=inventory_item.estimated_price
    )

    inventory_item.status = "discarded"

    db.add(history)
    db.commit()

    return {
        "message": "Inventory item marked as discarded",
        "item_id": inventory_item.item_id,
        "status": inventory_item.status
    }


@router.get(
    "/{item_id}",
    response_model=InventoryResponse
)
def get_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inventory_item = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id
            == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id
            == Household.household_id
        )
        .filter(
            Inventory.item_id == item_id,
            Household.created_by == current_user.user_id
        )
        .first()
    )

    if not inventory_item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )

    return inventory_item

@router.put(
    "/{item_id}",
    response_model=InventoryResponse
)
def update_inventory_item(
    item_id: int,
    item_data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    inventory_item = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Inventory.item_id == item_id,
            Household.created_by == current_user.user_id
        )
        .first()
    )

    if not inventory_item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )

    new_refrigerator = (
        db.query(Refrigerator)
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Refrigerator.refrigerator_id == item_data.refrigerator_id,
            Household.created_by == current_user.user_id
        )
        .first()
    )

    if not new_refrigerator:
        raise HTTPException(
            status_code=404,
            detail="Refrigerator not found"
        )

    inventory_item.refrigerator_id = item_data.refrigerator_id
    inventory_item.item_name = item_data.item_name
    inventory_item.item_type = item_data.item_type
    inventory_item.category = item_data.category
    inventory_item.unit = item_data.unit
    inventory_item.quantity = item_data.quantity
    inventory_item.storage_type = item_data.storage_type
    inventory_item.date_added = item_data.date_added
    inventory_item.expiry_date = item_data.expiry_date
    inventory_item.image_url = item_data.image_url
    inventory_item.estimated_price = item_data.estimated_price
    inventory_item.notes = item_data.notes

    db.commit()
    db.refresh(inventory_item)

    return inventory_item

@router.delete("/{item_id}")
def delete_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inventory_item = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id
            == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id
            == Household.household_id
        )
        .filter(
            Inventory.item_id == item_id,
            Household.created_by == current_user.user_id
        )
        .first()
    )

    if not inventory_item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )

    db.delete(inventory_item)
    db.commit()

    return {
        "message": "Inventory item deleted successfully"
    }

@router.get(
    "/search/{item_name}",
    response_model=list[InventoryResponse]
)
def search_inventory(
    item_name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inventory_items = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id
            == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id
            == Household.household_id
        )
        .filter(
            Household.created_by == current_user.user_id,
            Inventory.item_name.ilike(f"%{item_name}%"),
            Inventory.status == "active"
        )
        .all()
    )

    return inventory_items

@router.get(
    "/category/{category}",
    response_model=list[InventoryResponse]
)
def get_inventory_by_category(
    category: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inventory_items = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id
            == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id
            == Household.household_id
        )
        .filter(
            Household.created_by == current_user.user_id,
            Inventory.category.ilike(category),
            Inventory.status == "active"
        )
        .all()
    )

    return inventory_items

@router.get(
    "/low-stock",
    response_model=list[InventoryResponse]
)
def get_low_stock_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inventory_items = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id
            == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id
            == Household.household_id
        )
        .filter(
            Household.created_by == current_user.user_id,
            Inventory.quantity <= 1,
            Inventory.status == "active"
        )
        .all()
    )

    return inventory_items


@router.get(
    "/refrigerator/{refrigerator_id}",
    response_model=list[InventoryResponse]
)
def get_refrigerator_inventory(
    refrigerator_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    refrigerator = (
        db.query(Refrigerator)
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Refrigerator.refrigerator_id == refrigerator_id,
            Household.created_by == current_user.user_id,
            Inventory.status == "active"
        )
        .first()
    )

    if not refrigerator:
        raise HTTPException(
            status_code=404,
            detail="Refrigerator not found"
        )

    return (
        db.query(Inventory)
        .filter(
            Inventory.refrigerator_id == refrigerator_id
        )
        .all()
    )

@router.get(
    "/expired",
    response_model=list[InventoryResponse]
)
def get_expired_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    expired_items = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Household.created_by == current_user.user_id,
            Inventory.expiry_date.isnot(None),
            Inventory.expiry_date < date.today(),
            Inventory.status == "active"
        )
        .all()
    )

    return expired_items

@router.get(
    "/expiring-soon",
    response_model=list[InventoryResponse]
)
def get_expiring_soon_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = date.today()
    upcoming_date = today + timedelta(days=7)

    expiring_items = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id == Refrigerator.refrigerator_id
        )
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Household.created_by == current_user.user_id,
            Inventory.expiry_date.isnot(None),
            Inventory.expiry_date >= today,
            Inventory.expiry_date <= upcoming_date,
            Inventory.status == "active"
        )
        .all()
    )

    return expiring_items
