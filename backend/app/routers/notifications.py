
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..auth import get_current_user
from ..database import SessionLocal
from ..models.notification import Notification
from ..services.expiry_notification import generate_expiry_notifications

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def notification_to_response(notification: Notification) -> dict:
    return {
        "notification_id": notification.notification_id,
        "user_id": notification.user_id,
        "item_id": notification.item_id,
        "message": notification.message,
        "notification_type": notification.notification_type,
        "sent_on": notification.sent_on,
        "created_at": notification.sent_on,
        "is_read": notification.is_read,
    }

@router.get("")
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.user_id)
        .order_by(Notification.sent_on.desc())
        .all()
    )

    return [
        notification_to_response(notification)
        for notification in notifications
    ]

@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.notification_id == notification_id,
            Notification.user_id == current_user.user_id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return notification_to_response(notification)


@router.patch("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    updated_count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.user_id,
            Notification.is_read.is_(False)
        )
        .update(
            {Notification.is_read: True},
            synchronize_session=False
        )
    )

    db.commit()

    return {
        "message": "All notifications marked as read",
        "updated_count": updated_count
    }


@router.post("/generate")
def generate_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    created_count = generate_expiry_notifications(db, current_user.user_id,)

    return {
        "message": "Expiry notification check completed",
        "created_count": created_count,
    }