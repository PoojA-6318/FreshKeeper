from apscheduler.schedulers.background import BackgroundScheduler
from ..database import SessionLocal
from .expiry_notification import generate_notifications_for_all_users

scheduler = BackgroundScheduler()

def check_expiring_items():
    db = SessionLocal()
    try:
        created = generate_notifications_for_all_users(db)
        print(
            f"Expiry notification check completed. "
            f"Created {created} notification(s)."
        )
    except Exception as exc:
        print(f"Expiry notification check failed: {exc}")
    finally:
        db.close()


def start_notification_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            check_expiring_items,
            trigger="interval",
            minutes=1,
            id="expiry_notification_check",
            replace_existing=True,
            max_instances=1,
        )
        scheduler.start()

def stop_notification_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)