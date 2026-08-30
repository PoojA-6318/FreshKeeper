from fastapi import FastAPI
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

app = FastAPI(
    title="FreshKeeper API",
    description="Backend API for the FreshKeeper household food inventory system",
    version="1.0.0"
)
app.include_router(users_router)
Base.metadata.create_all(bind=engine)

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