from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .database import Base, engine
from .models import (
    User,
    Household,
    HouseholdMember,
    Refrigerator,
    Inventory,
    ShoppingList,
    ConsumptionHistory,
    Notification,
)
from .routers.users import router as users_router
from .routers.refrigerators import router as refrigerators_router
from .routers.inventory import router as inventory_router
from .routers.household import router as household_router
from .routers.notifications import router as notifications_router
from contextlib import asynccontextmanager
from .services.notification_scheduler import start_notification_scheduler, stop_notification_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_notification_scheduler()
    try:
        yield
    finally:
        stop_notification_scheduler()

app = FastAPI(
    title="FreshKeeper API",
    description="Backend API for the FreshKeeper household food inventory system",
    version="1.0.0",
    lifespan=lifespan
)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(refrigerators_router)
app.include_router(inventory_router)
app.include_router(household_router)
app.include_router(notifications_router)

@app.get("/")
def root():
    return {
        "message": "FreshKeeper API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/health/database")
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "database": "connected"
        }

    except Exception as e:
        return {
            "database": "connection failed",
            "error": str(e)
        }