# FreshKeeper

FreshKeeper is a web-based household food inventory system that helps users manage food across multiple refrigerators, track expiry dates, estimate freshness for homemade meals, receive timely reminders, and record consumed or discarded items. It also provides basic waste analytics and a shared shopping list to help households reduce food waste.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React (Vite), Tailwind CSS, React Router, Axios |
| Backend    | Python, FastAPI, Pydantic, SQLAlchemy |
| Database   | PostgreSQL                          |
| Auth       | JWT-based authentication, bcrypt    |

## Project Structure

```text
FreshKeeper/
├── backend/        → FastAPI server, REST APIs, and business logic
├── frontend/       → React UI, pages, components, and API integration
├── database/       → SQL scripts, migrations, seed data
├── docs/           → Architecture diagrams, ERD, SRS, DFD, sequence diagrams
└── README.md       → This file
```

## Architecture

```
React Frontend
      ↓
   FastAPI
      ↓
 PostgreSQL
```

## Getting Started

> Setup instructions will be added as the project progresses through each increment.

## Increments

| Increment   | Focus                                   |
|-------------|-----------------------------------------|
| Increment 1 | Core system – Auth, Users, Households   |
| Increment 2 | Inventory – Refrigerators, Food Items, Expiry |
| Increment 3 | Smart Notifications & Reminders         |
| Increment 4 | Analytics, Consumption History, Shopping List |
