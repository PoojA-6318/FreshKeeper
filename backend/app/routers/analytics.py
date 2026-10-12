
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..auth import get_current_user
from ..database import SessionLocal
from ..models.consumption_history import ConsumptionHistory
from ..models.inventory import Inventory
from ..models.refrigerator import Refrigerator
from ..models.household import Household

router = APIRouter(
    prefix="/analytics", 
    tags=["Analytics"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_history_query(db: Session, user_id: int):
    """Return history belonging to the user's created households."""
    return (
        db.query(ConsumptionHistory)
        .join(
            Inventory,
            ConsumptionHistory.item_id == Inventory.item_id,
        )
        .join(
            Refrigerator,
            Inventory.refrigerator_id == Refrigerator.refrigerator_id,
        )
        .join(
            Household,
            Refrigerator.household_id == Household.household_id,
        )
        .filter(
            ConsumptionHistory.user_id == user_id,
            Household.created_by == user_id,
        )
    )


@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    history = get_user_history_query(
        db, current_user.user_id
    ).all()

    total_consumed = sum(
        1 for record in history
        if record.action == "consumed"
    )
    total_discarded = sum(
        1 for record in history
        if record.action == "discarded"
    )

    total_actions = total_consumed + total_discarded

    waste_rate = (
        round(total_discarded / total_actions * 100, 1)
        if total_actions else 0
    )

    total_tracked = len({
        record.item_id
        for record in history
        if record.action in ("consumed", "discarded")
    })

    return {
        "total_consumed": total_consumed,
        "total_discarded": total_discarded,
        "waste_rate": waste_rate,
        "total_tracked": total_tracked,
    }


@router.get("/monthly")
def analytics_monthly(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    now = datetime.utcnow()

    # Include the current month and the previous five months.
    first_current_month = now.replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )

    months = []
    year = first_current_month.year
    month = first_current_month.month

    for _ in range(6):
        months.append({
            "year": year,
            "month_number": month,
            "month": datetime(year, month, 1).strftime("%b %y"),
            "consumed": 0,
            "discarded": 0,
        })

        month -= 1
        if month == 0:
            month = 12
            year -= 1

    months.reverse()

    start_year = months[0]["year"]
    start_month = months[0]["month_number"]
    start_date = datetime(start_year, start_month, 1)

    records = (
        get_user_history_query(db, current_user.user_id)
        .filter(
            ConsumptionHistory.action_date >= start_date,
            ConsumptionHistory.action.in_(("consumed", "discarded")),
        )
        .all()
    )

    month_lookup = {
        (entry["year"], entry["month_number"]): entry
        for entry in months
    }

    for record in records:
        key = (
            record.action_date.year,
            record.action_date.month,
        )
        entry = month_lookup.get(key)

        if entry is None:
            continue

        if record.action == "consumed":
            entry["consumed"] += 1
        elif record.action == "discarded":
            entry["discarded"] += 1

    # The frontend only needs these four fields.
    return [
        {
            "month": entry["month"],
            "consumed": entry["consumed"],
            "discarded": entry["discarded"],
        }
        for entry in months
    ]
