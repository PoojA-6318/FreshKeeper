# FreshKeeper — Database

This folder contains all database-related files including SQL schema scripts, migration files, and seed data for FreshKeeper.

The application uses **PostgreSQL** as its primary database, managed via **SQLAlchemy** in the backend. However, raw SQL files here serve as documentation, migration history, and manual setup scripts.

## Folder Structure

```text
database/
├── migrations/          # Ordered schema migration scripts (applied sequentially)
│   ├── 001_create_users.sql
│   ├── 002_create_households.sql
│   ├── 003_create_household_members.sql
│   ├── 004_create_refrigerators.sql
│   ├── 005_create_item_types.sql
│   ├── 006_create_inventory_items.sql
│   ├── 007_create_consumption_history.sql
│   ├── 008_create_notifications.sql
│   └── 009_create_shopping_list.sql
│
├── seeds/               # Sample/test data for development and testing
│   ├── seed_users.sql
│   ├── seed_households.sql
│   ├── seed_item_types.sql
│   └── seed_inventory.sql
│
├── schema.sql           # Full database schema in one file (snapshot)
└── README.md            # This file
```

## Entity Overview

```text
User
 └── HouseholdMember (role: OWNER | MEMBER)
       └── Household
             ├── Refrigerator
             │      └── InventoryItem
             │             ├── ItemType (category)
             │             └── ConsumptionHistory
             ├── ShoppingList
             └── Notification
```

## Tables Summary

| Table               | Description                                         |
|---------------------|-----------------------------------------------------|
| users               | Registered user accounts (email, hashed password)   |
| households          | Shared household units                              |
| household_members   | User-to-household membership with roles             |
| refrigerators       | Refrigerators/freezers belonging to a household     |
| item_types          | Food categories (Dairy, Fruits, Meat, etc.)         |
| inventory_items     | Food items stored in a refrigerator                 |
| consumption_history | Record of consumed or discarded food items          |
| notifications       | In-app expiry alerts and reminders                  |
| shopping_list       | Shared household shopping checklist                 |

## Key Relationships

```text
users.user_id               → household_members.user_id
households.household_id     → household_members.household_id
households.household_id     → refrigerators.household_id
refrigerators.fridge_id     → inventory_items.fridge_id
item_types.type_id          → inventory_items.item_type_id
inventory_items.item_id     → consumption_history.item_id
households.household_id     → shopping_list.household_id
users.user_id               → notifications.user_id
```

## How Migrations Work

Migration files in `migrations/` are numbered sequentially. Apply them in order during initial setup or schema changes:

```bash
psql -U postgres -d freshkeeper -f database/migrations/001_create_users.sql
psql -U postgres -d freshkeeper -f database/migrations/002_create_households.sql
# ... and so on
```

Or apply the full snapshot at once:

```bash
psql -U postgres -d freshkeeper -f database/schema.sql
```

## Seeding Development Data

```bash
psql -U postgres -d freshkeeper -f database/seeds/seed_users.sql
psql -U postgres -d freshkeeper -f database/seeds/seed_item_types.sql
```
