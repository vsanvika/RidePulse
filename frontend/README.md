# RidePulse Frontend

This is the React + Vite frontend for RidePulse, a real-time campus shuttle and safety management application. It provides role-based dashboards for students, drivers, and administrators and connects to the backend through REST and Socket.IO.

## Overview

The frontend is responsible for:

- Authentication and protected routing
- Role-based dashboards for admin, driver, and student users
- Interactive campus map with live shuttle data
- Real-time alerts, notifications, and emergency updates
- QR boarding pass generation and ride history
- analytics, route management, and prediction panels
- responsive UI built for desktop and campus operations workflows

## Tech Stack

- React 19
- Vite
- React Router DOM
- Axios
- Leaflet + React Leaflet
- Recharts
- Zustand
- Socket.IO Client
- Tailwind CSS
- Framer Motion
- Lucide React icons

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/
│   │   ├── alerts/
│   │   ├── analytics/
│   │   ├── common/
│   │   ├── intelligence/
│   │   ├── map/
│   │   ├── notifications/
│   │   └── safety/
│   ├── constants/
│   │   └── roles.js
│   ├── hooks/
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   ├── AppLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   ├── DriverLayout.jsx
│   │   └── StudentLayout.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── UnauthorizedPage.jsx
│   │   ├── admin/
│   │   ├── driver/
│   │   └── student/
│   ├── routes/
│   │   └── AppRouter.jsx
│   ├── services/
│   │   ├── adminService.js
│   │   ├── api.js
│   │   ├── dataService.js
│   │   └── socket.js
│   ├── store/
│   │   └── socketStore.js
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Required setup

Before starting the frontend, make sure the backend is running.

The frontend expects the backend to be available at:

- `http://localhost:5000`

The Vite config proxies `/api` and `/socket.io` to that server.

## Installation

From the frontend directory:

```bash
npm install
```

## Running the app

### Development mode

```bash
npm run dev
```

The app runs on:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Routing model

The app uses React Router and role-protected routes.

### Public routes

- `/`
- `/login`
- `/register`
- `/unauthorized`

### Student routes

- `/student/dashboard`
- `/student/pass`
- `/student/ride-history`
- `/student/sustainability`

### Driver routes

- `/driver/dashboard`
- `/driver/scanner`

### Admin routes

- `/admin/dashboard`
- `/admin/live-map`
- `/admin/stops`
- `/admin/routes`
- `/admin/shuttles`
- `/admin/drivers`
- `/admin/students`
- `/admin/alerts`
- `/admin/emergencies`
- `/admin/breakdowns`
- `/admin/analytics`
- `/admin/predictions`
- `/admin/settings`

## API integration

The frontend centralizes API requests in `src/services/api.js` and data-access helpers in `src/services/dataService.js`.

### HTTP client behavior

- Base URL is `/api`
- Authorization header is attached from local storage when a token is present
- If a request gets a `401`, the app clears the stored token for non-auth endpoints

## Real-time updates

The front end uses `socket.io-client` and the Zustand store to subscribe to live updates from the backend.

### Main socket events consumed

- `shuttle:location`
- `shuttle:update`
- `alert:new`
- `notification:new`
- `emergency:new`
- `simulation:status`

This allows the map, dashboards, and notification panels to refresh without a full app reload.

## State and UI patterns

### Zustand store

The `useSocketStore` handles:

- socket initialization
- shuttle map state
- simulation state
- live location and status updates

### Layouts

Role-based layouts separate different app experiences:

- `StudentLayout.jsx`
- `DriverLayout.jsx`
- `AdminLayout.jsx`
- `AuthLayout.jsx`

### Components

The app includes dedicated UI modules for:

- campus map
- route and shuttle controls
- alerts and notifications
- analytics cards and charts
- emergency handling and safety actions
- QR pass generation and scan flow

## Environment notes

The frontend is configured to work with the backend via Vite proxy settings:

```js
proxy: {
  "/api": {
    target: "http://localhost:5000",
    changeOrigin: true,
  },
  "/socket.io": {
    target: "http://localhost:5000",
    changeOrigin: true,
    ws: true,
  },
}
```

This means you normally do not need to change the URL manually during local development.

## Common workflows

### Student flow

- log in as a student
- view live shuttle map
- check nearest routes and recommendations
- generate a QR boarding pass
- track ride history and sustainability stats

### Driver flow

- log in as a driver
- view assigned route info
- verify student QR passes
- monitor shuttle status and route updates

### Admin flow

- log in as admin
- manage routes, stops, shuttles, drivers, and students
- monitor alerts and emergencies
- review analytics and predictions
- trigger or manage simulation data

## Typical development flow

1. Start the backend server
2. Ensure MongoDB is running
3. Install frontend dependencies with `npm install`
4. Run `npm run dev`
5. Open the app in the browser at `http://localhost:5173`
6. Log in using a demo account from the main project README if available

## Troubleshooting

### App does not load

- Confirm the backend is running on port `5000`
- Check the browser console for API or socket connection errors
- Ensure `npm install` has completed successfully

### Authentication problems

- Verify the backend JWT secret is configured correctly
- Ensure the token is stored in local storage and sent on API calls

### Socket connection issues

- Verify the backend is running and accessible
- Check the frontend and backend are both using the same local host and port expectations

## Notes

This frontend is designed as a real-time operational dashboard for campus transport services. It prioritizes live visibility, responsive dashboards, role-specific workflows, and clear user actions across student, driver, and administrative experiences.
