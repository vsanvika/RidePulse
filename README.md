# 🚍 RidePulse – Real-Time Campus Transportation & Safety Intelligence System

> **A production-ready, AI-enhanced, real-time campus shuttle tracking, communication, and safety management platform built for modern university ecosystems.**

---

## 🌟 Executive Summary

**RidePulse** transforms university transit operations by connecting students, shuttle drivers, and administrators into an integrated real-time ecosystem. Featuring zero-teleportation live map simulation, dynamic ETA calculation, AI-driven crowd predictions, student SOS emergency reporting, automated breakdown detection, digital QR boarding passes, carbon savings tracking, and a professional multi-tenant administration suite.

---

## 🚀 Key Features by Phase

### 🛰️ Live Tracking & Simulation Engine
- **OpenStreetMap & React Leaflet**: High-performance interactive campus map with custom status-coded shuttle markers.
- **Gradual Motion Engine**: Backend simulation engine calculating interpolated geographic vectors between campus stops without teleportation.
- **Socket.IO Event Stream**: Real-time broadcasts (`shuttle:location`, `shuttle:update`, `shuttle:status`, `shuttle:crowd`).

### 🤖 Transportation Intelligence & AI Insights
- **Dynamic ETA Engine**: Continuous ETA estimation computed from current coordinates, route segment distance, average speed, and delay factors.
- **Crowd Density Classifier**:
  - `0–40%`: **LOW** (Green)
  - `41–75%`: **MEDIUM** (Amber)
  - `76–100%`: **HIGH** (Red)
- **Smart Trip Planner**: Point-to-point shuttle recommendation algorithm prioritizing lowest total travel time, ETA, and seat availability.
- **Nearest Stop Calculator**: Haversine formula calculation finding closest campus stops and estimated walking time.
- **AI Crowd Prediction Service**: Historical time-series regression model predicting route crowd density across peak academic hours.

### 🚨 Real-Time Communication & Safety System
- **Broadcast Service Alerts**: Admin broadcast advisories (`INFO`, `WARNING`, `CRITICAL`) pushed instantly to connected client sessions.
- **Student SOS Emergency Reporting**: Immediate reporting workflow categorized by urgency (`Medical Emergency`, `Accident`, `Unsafe Situation`, `Vehicle Problem`).
- **Automated Breakdown Detector**: Automatic detection of stationary vehicles triggering immediate admin notifications and rerouting controls.
- **Centralized Notification Center**: Drawer popover with badge counts, toast alerts, and read/unread status updates.

### 💳 Student Convenience & Sustainability Suite
- **Digital QR Boarding Pass**: Pass generator rendering dynamic QR code tickets verified by driver scanners (`/driver/scanner`).
- **Automated Ride History**: Complete trip logging with timestamps, boarding stops, destination stops, and vehicle IDs.
- **Carbon Offset Dashboard**: Documented CO₂ emission calculations ($170\text{g solo car} - 40\text{g shuttle} = 0.455\text{ kg CO}_2 \text{ saved / ride}$) with Recharts metrics and tree equivalent badges.

### 📊 Professional Admin Fleet Control Suite
- **13-Module Sidebar Navigation**: Dashboard, Live Map, Shuttles, Routes, Stops, Drivers, Students, Alerts, Emergencies, Breakdowns, Analytics, Predictions, Settings.
- **Database-Driven Metrics**: 6 real-time metrics cards powered by MongoDB backend queries.
- **Recharts Fleet Analytics**: Interactive multi-metric series filtering by `Today`, `7 Days`, `30 Days`, `Route`, and `Shuttle`.

---

## 🏗️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite, React Router DOM v6, Zustand (State Management) |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons, Recharts Analytics |
| **Mapping** | Leaflet, React Leaflet, OpenStreetMap Tile Layer |
| **Backend Framework** | Node.js, Express.js |
| **Real-Time Layer** | Socket.IO WebSockets |
| **Database & ORM** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js Password Hashing |

---

## 📁 Repository Directory Structure

```text
RidePulse/
├── backend/
│   ├── config/             # DB & Environment Configuration
│   ├── controllers/        # Express Route Controllers (16 controllers)
│   ├── middleware/         # Auth, Role Authorization, Error Handler, Not Found
│   ├── models/             # Mongoose Schemas (User, Shuttle, Route, Stop, Alert, EmergencyReport, QRPass, Ride, Driver, Notification)
│   ├── routes/             # REST Express Routers
│   ├── seed/               # Demo Database Seeder Scripts
│   ├── simulation/         # Geolocation Interpolation Simulation Engine
│   ├── sockets/            # Socket.IO Gateway & Event Handlers
│   ├── utils/              # ApiResponse & Geolocation Utilities
│   └── server.js           # Server Entry Point (Port 5000)
└── frontend/
    ├── public/             # Static Assets
    ├── src/
    │   ├── components/     # Modals, Banners, Maps, Charts, Skeletons
    │   ├── layouts/        # Student, Driver, Admin & Auth Responsive Layouts
    │   ├── pages/          # 18 Modular Portal Pages
    │   ├── routes/         # AppRouter & Protected Role-Based Guards
    │   ├── services/       # Axios API Clients
    │   └── store/          # Zustand Auth, Theme & Socket Stores
    ├── index.html
    └── vite.config.js
```

---

## ⚙️ Installation & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI

### 1. Clone & Setup Environment
```bash
git clone https://github.com/vsanvika/RidePulse.git
cd RidePulse
```

Create `.env` file in root directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ridepulse
JWT_SECRET=ridepulse_secret_key_2026
CLIENT_URL=http://localhost:5173
```

### 2. Backend Installation & Database Seeding
```bash
cd backend
npm install
node server.js
```
*Note: The server will automatically connect to MongoDB, run seed scripts for campus stops, routes, shuttles, demo users, and start the shuttle simulation engine.*

### 3. Frontend Installation & Running
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `student@ridepulse.demo` | `Student123!` | Live Tracking, Trip Planner, SOS, Boarding Pass, Ride History, CO₂ Offset |
| **Driver** | `driver@ridepulse.demo` | `Driver123!` | Telemetry Console, Pass Verification QR Scanner |
| **Admin** | `admin@ridepulse.demo` | `Admin123!` | Complete Fleet Control, Emergency Triage, Service Alerts Broadcast, Recharts Analytics |

---

## 📡 REST API & Socket.IO Specification

### Core REST Endpoints
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `POST /api/auth/register` - Register new student account.
- `GET /api/shuttles` - List active campus shuttles with live coordinates & telemetry.
- `GET /api/intelligence/recommendations` - Get smart shuttle recommendations based on Origin and Destination.
- `GET /api/predictions/crowd/:routeId` - Get ML crowd predictions for route.
- `POST /api/emergencies` - Student emergency SOS report submission.
- `POST /api/alerts` - Admin service alert publication.
- `POST /api/passes/generate` - Generate student digital QR boarding pass.
- `POST /api/passes/verify` - Driver scanner verification endpoint.
- `GET /api/sustainability/stats` - CO₂ carbon savings & trees planted calculation.
- `GET /api/admin/metrics` - Database-driven fleet dashboard metrics.

### Socket.IO Events
- `shuttle:location` - Pushes updated latitude, longitude, and bearing.
- `shuttle:update` - Pushes updated speed, crowd level, occupancy, and status.
- `alert:new` - Real-time broadcast of published service advisories.
- `emergency:new` - Instant dispatch of student emergency SOS to admin console.
- `notification:new` - Real-time push notification to user drawer.

---

## 🏆 Hackathon Presentation Checklist

- ✅ **Live Map Tracking**: Shuttles move smoothly on OpenStreetMap between stops without teleportation.
- ✅ **Real-Time SOS**: Student clicks SOS -> Instant alert appears on Admin Emergency Console.
- ✅ **QR Pass & Scan**: Student generates pass -> Driver verifies via `/driver/scanner` -> Ride auto-logged to database.
- ✅ **Breakdown Resolution**: Admin resolves flagged breakdown -> Vehicle resumes on-time status.
- ✅ **Full Dark Mode**: Seamless toggle between dark and light themes across every dashboard module.
