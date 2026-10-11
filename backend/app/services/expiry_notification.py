
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from ..models.inventory import Inventory
from ..models.notification import Notification
from ..models.refrigerator import Refrigerator
from ..models.household import Household
from ..models.user import User


def generate_expiry_notifications(
    db: Session,
    user_id: int,
) -> int:
    today = date.today()
    upcoming_date = today + timedelta(days=7)

    items = (
        db.query(Inventory)
        .join(
            Refrigerator,
            Inventory.refrigerator_id == Refrigerator.refrigerator_id,
        )
        .join(
            Household,
            Refrigerator.household_id == Household.household_id,
        )
        .filter(
            Household.created_by == user_id,
            Inventory.status == "active",
            Inventory.expiry_date.isnot(None),
            Inventory.expiry_date >= today,
            Inventory.expiry_date <= upcoming_date,
        )
        .all()
    )

    created_count = 0

    try:
        for item in items:
            if item.expiry_date == today:
                notification_type = "expiry_today"
                message = f"{item.item_name} expires today."
            else:
                notification_type = "expiry_soon"
                days_left = (item.expiry_date - today).days
                message = (
                    f"{item.item_name} expires in {days_left} day(s)."
                )

            existing = (
                db.query(Notification)
                .filter(
                    Notification.user_id == user_id,
                    Notification.item_id == item.item_id,
                    Notification.notification_type == notification_type,
                )
                .first()
            )

            if existing:
                continue

            notification = Notification(
                user_id=user_id,
                item_id=item.item_id,
                message=message,
                notification_type=notification_type,
                sent_on=datetime.utcnow(),
                is_read=False,
            )

            db.add(notification)
            created_count += 1

        db.commit()
        return created_count

    except Exception:
        db.rollback()
        raise


def generate_notifications_for_all_users(db):
    user_ids = [
        row[0]
        for row in db.query(User.user_id).all()
    ]

    total_created = 0

    for user_id in user_ids:
        total_created += generate_expiry_notifications(
            db, user_id
        )

    return total_created