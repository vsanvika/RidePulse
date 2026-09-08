# RidePulse

RidePulse is a full-stack smart campus shuttle platform for students, drivers, and transport administrators. It combines simulated real-time GPS tracking, route intelligence, crowd monitoring, safety communication, digital boarding passes, analytics, and fleet operations in one responsive application.

The project is designed to run without physical GPS hardware or paid map APIs. Shuttle movement is simulated along seeded campus routes and broadcast through Socket.IO.

## Product Capabilities

### Student portal

- Student registration, login, logout, profile editing, and dark mode.
- Responsive dashboard with OpenStreetMap campus map, shuttle markers, stop markers, route lines, route filtering, shuttle details, current stop, next stop, ETA, status, crowd level, capacity, and nearby stops.
- Multiple shuttle tracking with live Socket.IO location and telemetry updates.
- Route and stop browsing, nearest-stop lookup, journey planner, and smart shuttle recommendation.
- Favorite routes and stops.
- Service alerts, delay/breakdown notifications, unread counts, mark-read controls, and notification history.
- Digital QR boarding pass generation and student ride history.
- Emergency SOS reporting, shuttle issue reports, feedback, ratings, and sustainability statistics.

### Driver console

- Driver login and administrator-controlled shuttle assignment.
- Read-only view of the assigned shuttle, route, current stop, and next stop.
- Start trip, end trip, mark stop reached, update passenger count, and update operational status.
- Automatic crowd-level recalculation from passenger count and capacity.
- Report delays, breakdowns, and emergencies to operations staff.
- QR boarding-pass verification with automatic ride logging.

Drivers cannot claim or switch vehicles from the driver console. Assignment and unassignment are managed in **Admin > Drivers** so every shuttle has a controlled owner.

### Admin operations

- Dashboard metrics for fleet, students, rides, delays, crowd, alerts, emergencies, drivers, and routes.
- Live fleet map and real-time shuttle monitoring.
- Create, edit, delete, activate, disable, and resolve shuttle records.
- Manage routes, ordered stops, schedules, vehicle capacity, drivers, and student accounts.
- Assign or unassign shuttles from drivers. Assigned vehicles are protected from duplicate assignment.
- Publish and remove service alerts and emergency announcements.
- Review emergencies, breakdowns, feedback, and issue reports.
- Database-backed analytics for daily rides, route usage, stop usage, hourly crowd, shuttle utilization, and carbon savings.
- Trend-based crowd predictions and operational intelligence cards.
- Start, pause, reset, delay, break down, recover, and simulate high-crowd fleet events.
- Configure simulation speed, breakdown timeout, and crowd thresholds.

## Architecture

```text
React + Vite frontend
        |
        | Axios REST API + authenticated Socket.IO
        v
Express backend + JWT middleware
        |
        +-- Mongoose models and MongoDB
        +-- Shuttle simulation engine
        +-- Prediction and recommendation services
        +-- Role-based controllers and routes
```

The application uses a modular client/server structure:

```text
RidePulse/
├── backend/
│   ├── config/         MongoDB and environment configuration
│   ├── controllers/    Request handlers and business workflows
│   ├── middleware/     JWT auth, roles, errors, and not-found handling
│   ├── models/         Mongoose schemas and relationships
│   ├── routes/         REST endpoint definitions
│   ├── seed/           Demo users and campus data
│   ├── services/       Predictions and domain services
│   ├── simulation/     Simulated shuttle movement
│   ├── sockets/        Authenticated Socket.IO gateway
│   └── server.js       API and WebSocket entry point
└── frontend/
    ├── src/components/ Reusable maps, charts, alerts, safety, and UI controls
    ├── src/layouts/    Student, driver, admin, and auth layouts
    ├── src/pages/      Public and role-specific screens
    ├── src/routes/     Protected role-based routing
    ├── src/services/   Axios service clients
    ├── src/store/      Auth, theme, and live socket state
    └── vite.config.js  Development server and API/WebSocket proxy
```

## Technology Stack

### Frontend

- React 19 and Vite
- React Router
- Tailwind CSS
- Axios
- Zustand
- React Hook Form
- Recharts
- Leaflet and React Leaflet with OpenStreetMap
- Socket.IO Client
- Lucide React
- Framer Motion
- `qrcode.react`

### Backend

- Node.js 18+
- Express 5
- MongoDB and Mongoose
- JWT authentication
- bcryptjs password hashing
- Socket.IO
- CORS and dotenv

## Local Setup

### Prerequisites

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

### Clone and configure

```bash
git clone https://github.com/vsanvika/RidePulse.git
cd RidePulse
```

Copy `.env.example` to `.env` at the repository root and configure:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ridepulse
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

The backend also accepts environment files from the backend directory. Never commit real secrets.

### Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### Run the backend

```bash
cd backend
npm run dev
```

The API listens on `http://localhost:5000`. On startup it connects to MongoDB, seeds demo users and campus data when needed, initializes Socket.IO, and starts the shuttle simulation.

### Run the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

Only one backend process can use port `5000`. If you see `EADDRINUSE`, stop the existing process before starting another one.

## Demo Accounts

| Role | Email | Password | Portal |
| --- | --- | --- | --- |
| Student | `student@ridepulse.demo` | `Student123!` | `/student/dashboard` |
| Driver | `driver@ridepulse.demo` | `Driver123!` | `/driver/dashboard` |
| Admin | `admin@ridepulse.demo` | `Admin123!` | `/admin/dashboard` |

Public registration supports Student and Driver accounts. Admin accounts are seeded or managed administratively. A driver must have a Driver profile and shuttle assignment before operational controls can be used.

## Authentication and Authorization

- Passwords are hashed with bcryptjs.
- Login returns a JWT used by Axios and Socket.IO.
- API responses use `{ success, message, data }` on success and `{ success, message }` on errors.
- `STUDENT`, `DRIVER`, and `ADMIN` roles are enforced by backend middleware and frontend route guards.
- Public registration cannot create administrator accounts.
- Driver telemetry can only update the driver’s assigned shuttle.
- Admin shuttle assignment keeps `Driver.assignedShuttle` and `Shuttle.driver` synchronized.

## Simulation and Real-Time Data

The simulator is the source of live shuttle movement. It interpolates positions along ordered seeded stops, detects stops, updates current and next stops, changes passenger counts at stops, calculates crowd bands, and persists snapshots to MongoDB.

Supported simulation actions:

- Start, pause, and reset simulation.
- Simulate delay, breakdown, high crowd, and recovery.
- Configure speed multiplier, breakdown timeout, and crowd thresholds.

Crowd levels use occupancy percentage:

- `LOW`: 0-40%
- `MEDIUM`: 41-75%
- `HIGH`: 76-100%

The prediction service is trend-based and uses available operational history. It is not presented as a trained machine-learning model.

Socket.IO authenticates with the JWT handshake token and uses these rooms:

- `fleet`: authenticated students, drivers, and admins.
- `user:{userId}`: personal notifications.
- `admin`: emergencies, breakdowns, feedback, and operations events.

Important events include `shuttle:location`, `shuttle:update`, `shuttle:status`, `shuttle:crowd`, `simulation:status`, `alert:new`, `notification:new`, `emergency:new`, `emergency:update`, `breakdown:new`, and `feedback:new`.

## REST API Areas

All endpoints are under `/api`.

| Area | Examples |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`, `POST /api/auth/favorites` |
| Campus | `/api/stops`, `/api/routes`, `/api/shuttles` |
| Driver | `/api/drivers/me/shuttle`, `/api/drivers/me/trip/start`, `/api/drivers/me/trip/end`, `/api/drivers/me/report`, `/api/drivers/me/stop/reached` |
| Intelligence | `/api/intelligence/nearest-stops`, `/api/intelligence/plan-trip`, `/api/intelligence/eta` |
| Simulation | `/api/simulation/status`, `/api/simulation/start`, `/api/simulation/pause`, `/api/simulation/reset`, `/api/simulation/event` |
| Alerts | `GET /api/alerts`, admin `POST /api/alerts`, admin `DELETE /api/alerts/:id` |
| Notifications | `/api/notifications` |
| Safety | `/api/emergencies`, `/api/feedback` |
| Boarding | `/api/passes/generate`, `/api/passes/verify` |
| Rides | `/api/rides/history`, `POST /api/rides` |
| Predictions | `/api/predictions/crowd/:routeId`, `/api/predictions/insights` |
| Analytics | `/api/admin/metrics`, `/api/admin/analytics` |
| Settings | `GET/PUT /api/settings` |

## Ride and Boarding Flow

1. A student generates an active QR boarding pass for a route.
2. The driver verifies the pass from the QR Scanner console.
3. The backend validates the date and active status, marks the pass `USED`, and logs the ride with shuttle, route, boarding stop, destination stop, and completion timestamp.
4. The student can view the ride in Ride History.

## Validation and Verification

```bash
cd frontend
npm run build

cd ../backend
node --check server.js
```

The frontend build may report a non-blocking bundle-size warning from the current dependency graph.

## Security Notes

- Replace the demo JWT secret before deployment.
- Keep `.env` files out of Git.
- Use HTTPS and a restricted `CLIENT_URL` in production.
- Use a managed MongoDB user with least-privilege access.
- Rotate demo credentials before exposing the application publicly.

## License

This project is provided for educational, hackathon, and demonstration use.
