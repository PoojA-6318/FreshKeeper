# FreshKeeper — Backend

This folder contains the FastAPI server, database models, REST API endpoints, and all backend business logic for FreshKeeper.

## Tech Stack
- **Language:** Python 3.10+
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Validation:** Pydantic
- **Database:** PostgreSQL
- **Auth:** JWT tokens, bcrypt password hashing

## Folder Structure

```text
backend/
├── app/
│   ├── main.py                   # FastAPI app entry point, middleware, CORS
│   ├── database.py               # DB engine, session, and Base declaration
│   ├── dependencies.py           # Shared dependencies (get_db, get_current_user)
│   │
│   ├── models/                   # SQLAlchemy ORM table definitions
│   │   ├── user.py               # User table
│   │   ├── household.py          # Household + HouseholdMember tables
│   │   ├── refrigerator.py       # Refrigerator table
│   │   ├── inventory.py          # InventoryItem + ItemType tables
│   │   ├── notification.py       # Notification table
│   │   └── shopping.py           # ShoppingList table
│   │
│   ├── schemas/                  # Pydantic schemas for request/response
│   │   ├── user.py
│   │   ├── household.py
│   │   ├── refrigerator.py
│   │   ├── inventory.py
│   │   ├── notification.py
│   │   └── shopping.py
│   │
│   ├── routers/                  # FastAPI route handlers grouped by feature
│   │   ├── auth.py               # POST /auth/register, /auth/login, /auth/logout
│   │   ├── users.py              # GET /users/me
│   │   ├── households.py         # CRUD for /households
│   │   ├── refrigerators.py      # CRUD for /refrigerators
│   │   ├── inventory.py          # CRUD for /inventory
│   │   ├── notifications.py      # GET /notifications
│   │   └── shopping.py           # CRUD for /shopping-list
│   │
│   └── services/                 # Business logic layer
│       ├── auth_service.py       # Token creation, password hashing/verification
│       ├── inventory_service.py  # Inventory management logic
│       ├── expiry_service.py     # Expiry date calculations and status logic
│       └── notification_service.py # Notification generation and scheduling
│
├── tests/                        # Pytest unit and integration tests
│   ├── test_auth.py
│   ├── test_households.py
│   ├── test_inventory.py
│   └── test_expiry.py
│
├── .env                          # Environment variables (not committed to git)
├── .env.example                  # Example env file for other developers
├── requirements.txt              # Python package dependencies
└── README.md                     # This file
```

## API Overview

| Method | Endpoint                           | Description                    |
|--------|------------------------------------|--------------------------------|
| POST   | /auth/register                     | Register a new user            |
| POST   | /auth/login                        | Login and receive JWT token    |
| GET    | /users/me                          | Get current authenticated user |
| POST   | /households                        | Create a new household         |
| GET    | /households                        | List user's households         |
| POST   | /refrigerators                     | Add a refrigerator             |
| GET    | /inventory                         | List inventory items           |
| POST   | /inventory                         | Add a food item                |
| PUT    | /inventory/{id}                    | Edit a food item               |
| DELETE | /inventory/{id}                    | Remove a food item             |
| GET    | /notifications                     | Fetch user notifications       |
| GET    | /shopping-list                     | Fetch household shopping list  |

## Expiry Status Logic

```text
days_remaining = expiry_date - today

< 0           → EXPIRED
= 0           → EXPIRES TODAY
<= threshold  → EXPIRING SOON
otherwise     → NORMAL
```

## Running the Server

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs available at: `http://localhost:8000/docs`
