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

app = FastAPI(
    title="FreshKeeper API",
    description="Backend API for the FreshKeeper household food inventory system",
    version="1.0.0"
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