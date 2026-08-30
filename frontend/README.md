# FreshKeeper — Frontend

This folder contains the React-based user interface for FreshKeeper — all pages, components, state management, and API integration logic.

## Tech Stack
- **Library:** React 18 (Vite-powered)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State:** React Context API

## Folder Structure

```text
frontend/
├── public/                       # Static assets (favicon, icons, images)
│
├── src/
│   ├── components/               # Reusable UI building blocks
│   │   ├── Navbar.jsx            # Top navigation bar with notification bell
│   │   ├── Button.jsx            # Styled button component
│   │   ├── Input.jsx             # Styled form input component
│   │   ├── FoodCard.jsx          # Card displaying a food item with expiry status
│   │   ├── NotificationBell.jsx  # Bell icon with unread count badge
│   │   ├── ExpiryBadge.jsx       # Color-coded expiry status badge
│   │   ├── ConfirmModal.jsx      # Confirmation dialog (consume/discard actions)
│   │   └── Loading.jsx           # Loading spinner/skeleton
│   │
│   ├── pages/                    # Full page views (one per route)
│   │   ├── Login.jsx             # /login — email & password login form
│   │   ├── Register.jsx          # /register — name, email, password form
│   │   ├── Dashboard.jsx         # /dashboard — overview of items & stats
│   │   ├── Household.jsx         # /household — manage household & members
│   │   ├── Refrigerators.jsx     # /refrigerators — manage refrigerators
│   │   ├── Inventory.jsx         # /inventory — browse, search, filter food items
│   │   ├── AddFood.jsx           # /inventory/add — add new food item form
│   │   ├── EditFood.jsx          # /inventory/edit/:id — edit existing food item
│   │   ├── Notifications.jsx     # /notifications — view all in-app notifications
│   │   ├── Analytics.jsx         # /analytics — charts for consumption & waste
│   │   └── ShoppingList.jsx      # /shopping-list — shared household list
│   │
│   ├── services/
│   │   └── api.js                # Central Axios API service — all HTTP calls go here
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state — current user, token, login/logout
│   │
│   ├── routes/
│   │   └── ProtectedRoute.jsx    # Redirects unauthenticated users to /login
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useInventory.js       # Fetch and manage inventory state
│   │   └── useNotifications.js   # Fetch and poll notification state
│   │
│   ├── utils/                    # Helper functions
│   │   ├── dateUtils.js          # Date formatting and expiry calculations
│   │   └── constants.js          # Shared constants (units, categories, statuses)
│   │
│   ├── assets/                   # Images, icons, and other static media
│   │
│   ├── App.jsx                   # Root component — defines all routes
│   ├── main.jsx                  # React DOM mount point
│   └── index.css                 # Global styles and Tailwind directives
│
├── index.html                    # Vite HTML entry point
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── package.json                  # npm dependencies and scripts
└── README.md                     # This file
```

## Pages Overview

| Route                | Page              | Description                             |
|----------------------|-------------------|-----------------------------------------|
| /login               | Login.jsx         | User login                              |
| /register            | Register.jsx      | New user registration                   |
| /dashboard           | Dashboard.jsx     | Stats overview                          |
| /household           | Household.jsx     | Household and member management         |
| /refrigerators       | Refrigerators.jsx | Manage refrigerators                    |
| /inventory           | Inventory.jsx     | Search, filter, view food items         |
| /inventory/add       | AddFood.jsx       | Add new food item                       |
| /inventory/edit/:id  | EditFood.jsx      | Edit existing food item                 |
| /notifications       | Notifications.jsx | View all in-app notifications           |
| /analytics           | Analytics.jsx     | Consumption vs waste charts             |
| /shopping-list       | ShoppingList.jsx  | Shared household shopping list          |

## Expiry Status Colors

| Status        | Color  | Indicator |
|---------------|--------|-----------|
| Normal        | Green  | 🟢        |
| Expiring Soon | Yellow | 🟡        |
| Expires Today | Orange | 🟠        |
| Expired       | Red    | 🔴        |

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`
