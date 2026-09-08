# RidePulse — Implementation Plan

**Source of truth:** `PROJECT_SPEC.md`  
**Status:** Plan only — no application code in this document’s scope.  
**Stack:** React + Vite + Tailwind (client) · Node.js + Express + MongoDB + Socket.IO (server)

Do not implement all phases at once. After each phase: implement → run → test → fix → report, then wait for an explicit request to start the next phase.

---

## Architecture decisions (locked before Phase 1)

These choices keep simulation, real-time updates, ETA, prediction, and recommendations maintainable and demo-ready.

### Monorepo layout

```text
RidePulse/          (workspace root; spec folder name ridepulse/)
├── PROJECT_SPEC.md
├── DEVELOPMENT_PLAN.md
├── README.md
├── .gitignore
├── .env.example
├── client/         Vite React app
└── server/         Express API + Socket.IO + simulation
```

Run two processes in development: `server` (API + sockets + simulator) and `client` (Vite, proxy `/api` and `/socket.io` to the server).

### Backend layering

| Layer | Responsibility |
| --- | --- |
| `routes/` | HTTP paths, HTTP method, attach middleware |
| `validators/` | Request body/query validation |
| `controllers/` | Parse req, call services, send `{ success, message, data }` |
| `services/` | Business logic (simulation, ETA, crowd, prediction, recommend, carbon, insights) |
| `models/` | Mongoose schemas |
| `sockets/` | Socket.IO auth, rooms, emit helpers |
| `middleware/` | JWT, roles, errors, not-found |
| `seed/` | Demo campus data + users |

HTTP never interpolates shuttle positions. The simulator is the source of live GPS; REST is for CRUD, auth, history, and snapshots.

### Shuttle simulation architecture

**Goal:** Multiple shuttles move smoothly along polylines of ordered stops. No teleporting.

**Coordinate space:** Mock campus bounding box (fixed lat/lng extents in seed). Stops have `latitude`/`longitude`. Each route’s geometry is the ordered stop list; the simulator interpolates **along the great-circle (or equirectangular) segment** between consecutive stops.

**Tick loop (server-only):**

1. Admin starts simulation → `simulationService.start()` sets `setInterval` (e.g. 800–1500 ms).
2. Each tick, for every shuttle with `status` in `{ ON_TIME, DELAYED, STOPPED }` (not `BREAKDOWN`, `OFFLINE`, `COMPLETED`):
   - Advance a **progress** value along the current segment: `distanceThisTick = effectiveSpeed * dt`.
   - `effectiveSpeed` = base speed × delay factor (DELAYED slower) × stop dwell (STOPPED at 0 until dwell ends).
   - Recompute `currentLocation` by interpolating between `segmentStart` and `segmentEnd`.
   - If remaining segment distance ≤ epsilon: snap to stop (once), set `currentStop` / `nextStop`, optional dwell, then start next segment (loop last → first for circular routes).
   - Update `speed` (can jitter slightly for realism).
   - Optionally mutate `passengerCount` at stops (board/alight) unless a scripted “high crowd” event is active.
   - Derive `crowdLevel` from occupancy % vs **admin-configurable thresholds** (settings document or env defaults 0–40 / 41–75 / 76–100).
   - Recalculate ETAs for remaining stops (see ETA section).
   - Persist a **throttled** Mongo write (e.g. every N ticks or ≥ X meters moved) so DB does not write on every millisecond; in-memory state is canonical during a run.
   - Emit Socket.IO events (see below).

**In-memory vs Mongo:**

- Runtime: `Map<shuttleId, SimulationState>` (location, heading, segment index, progress, lastTick, dwellUntil, delayUntil, flags).
- Mongo `Shuttle` documents stay the durable snapshot for REST, admin CRUD, and restart after reset.
- `RESET SIMULATION` reloads seed positions and clears in-memory state.

**Scripted events (admin demo):**

- `SIMULATE DELAY` → set status `DELAYED`, reduce speed, optional `Alert`.
- `SIMULATE BREAKDOWN` → freeze movement, status `BREAKDOWN`, emit `breakdown:new`.
- `SIMULATE HIGH CROWD` → raise `passengerCount` toward capacity, emit `shuttle:crowd`.
- Stationary-timeout detector (Phase 7) can also create breakdown reports independently of the scripted button.

**Driver override:** Driver “start/end trip”, passenger count, delay/breakdown reports write to the same shuttle documents and merge with simulation (driver counts win until next auto-update if both exist — prefer: simulation passenger updates only when driver has not updated in last T seconds, or driver updates always win). Document the rule in README: **driver passenger count overrides simulation until trip ends**.

### Socket.IO architecture

**Single HTTP server:** Express `http.Server` + `socket.io` attached. CORS `CLIENT_URL`.

**Auth:** Client sends JWT in `handshake.auth.token`. Server verifies, attaches `userId` + `role`. Reject unauthenticated connections except optional public landing preview (prefer authenticated for live fleet).

**Rooms:**

| Room | Who joins | Why |
| --- | --- | --- |
| `fleet` | STUDENT, DRIVER, ADMIN | All live shuttle broadcasts |
| `user:{userId}` | that user | Personal notifications |
| `admin` | ADMIN | Emergencies, breakdowns, ops |
| `driver:{shuttleId}` | assigned driver | Optional targeted driver events |

**Emit policy (performance):**

- `shuttle:location` — **lightweight**: `{ shuttleId, lat, lng, heading, speed, ts }` only. High frequency.
- `shuttle:update` — **full snapshot** (stop names, ETA, passengers, crowd, status) on stop change, status change, crowd band change, or every K location ticks (e.g. 5–10).
- `shuttle:status` / `shuttle:crowd` — when those fields change (can be omitted if always folded into `shuttle:update`; spec lists them separately — implement as dedicated emits **and** include fields on `shuttle:update` so clients can subscribe to either).

**Client:** One Socket.IO connection in a `useSocket` hook (or store init), not per page. Zustand `shuttleStore` updates:

- Location events patch only `currentLocation` on that shuttle (avoid replacing the whole fleet array if using a `Record<id, Shuttle>` map).
- Full updates merge the shuttle object.

Do not open a second connection on map remount.

### Dynamic ETA architecture

**Service:** `server/services/etaService.js` — pure functions, unit-testable.

**Remaining distance:** Sum of (distance from current point to end of current segment) + (full lengths of subsequent segments until target stop).

**Effective speed:** `max(speed, minSpeedFloor)` so ETA does not explode when nearly stopped. Apply delay multiplier if `DELAYED`. Add remaining dwell if currently `STOPPED`.

**Formula:** `etaMinutes = remainingDistanceKm / effectiveSpeedKmh * 60`, then format: integer minutes, or `"Arriving"` if below ~1 min / ~50 m.

**Outputs:**

- `etaToNextStop`
- `etaToStop[stopId]` (trip planner / recommendation)
- `etaToDestination` for a chosen destination stop on the shuttle’s route

Recalculate on every simulation tick in memory; persist ETAs on throttled DB writes and on `shuttle:update`.

When a stop is reached: current/next stop swap, remaining path rebuilds, ETA resets for the new next stop.

### Crowd monitoring

**Service:** `crowdService.js`

```text
occupancyPercentage = (passengerCount / capacity) * 100
LOW / MEDIUM / HIGH from Settings.crowdThresholds
```

UI: `CrowdBadge` + `OccupancyBar`. Never hardcode occupancy on dashboards.

### AI crowd prediction (modular, not a trained model)

**Service:** `server/services/predictionService.js`  
**Isolation:** Controllers call only this module. A future ML model replaces the internals without changing `GET /api/predictions/crowd/:routeId`.

**Algorithm (v1 — statistical / trend-based):**

1. Load historical samples: rides + optional `Prediction` / crowd-history seed (hour-of-day, day-of-week, route, stop, passengerCount).
2. Bucket by time slot (e.g. 30 min) × route (and optionally stop).
3. Predicted occupancy = weighted average of historical occupancy in that bucket, boosted if current occupancy is already HIGH, damped overnight.
4. Map occupancy → LOW/MEDIUM/HIGH using the same thresholds as live crowd.
5. Persist or cache last run in `Prediction` documents for admin UI.

**Honesty:** UI and README label this as **trend-based prediction**, not a trained neural model.

### Smart recommendation (modular, not hardcoded)

**Service:** `server/services/recommendationService.js`

**Input:** `fromStopId`, `toStopId`, optional `at` time (default now).

**Filter:** Shuttles whose **active route** includes `from` then later `to` in stop order (circular routes: wrap allowed if path exists). Exclude `BREAKDOWN`, `OFFLINE`, `COMPLETED`.

**Score (lower is better, example weights — tune in settings later):**

```text
score = w1 * etaMinutesToFromStop
      + w2 * occupancyPercentage
      + w3 * (status === DELAYED ? delayPenalty : 0)
      + w4 * etaMinutesFromFromStopToDestination
```

Pick min score. Generate **reason** from which terms dominated (fastest, lowest crowd, fewest delays).

Trip planner returns **all candidates** sorted by score; first is `BEST OPTION`. Same engine for student dashboard “Recommended Shuttle” (use nearest stop as `from` if user has mock location).

---

## Shared contracts (all phases)

### API envelope

Success: `{ "success": true, "message": "...", "data": {} }`  
Error: `{ "success": false, "message": "..." }` — no stack traces.

HTTP: 200/201 success, 400 validation, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict, 500 generic.

### Roles

`STUDENT` | `DRIVER` | `ADMIN`

### Environment (`.env.example` only until Phase 1)

```text
PORT=
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
```

Optional later (still “required only”): `JWT_EXPIRES_IN`, `SIMULATION_TICK_MS` if needed for demo tuning.

### Demo users (seed in Phase 3)

| Role | Email |
| --- | --- |
| Student | `student@ridepulse.demo` |
| Driver | `driver@ridepulse.demo` |
| Admin | `admin@ridepulse.demo` |

Passwords hashed at seed time; document in README only, never in frontend source.

---

# Phase 1 — Project setup and architecture

**Goal:** Runnable empty shells: Vite client, Express server, Mongo connection, shared folders, Tailwind, routing skeleton, CORS, env, gitignore. No feature business logic yet.

### Dependencies on previous phases

None.

### Dependencies (packages)

**Server:** `express`, `mongoose`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `socket.io`, `http` (stdlib). Dev: `nodemon`.

**Client:** `react`, `react-dom`, `react-router-dom`, `axios`, `zustand`, `socket.io-client`, `react-leaflet`, `leaflet`, `recharts`, `lucide-react`, `framer-motion`, `react-hook-form`. QR library deferred to Phase 8 (`qrcode.react` or similar). Tailwind via Vite plugin (`tailwindcss`, `@tailwindcss/vite` or PostCSS setup matching current Tailwind v4/v3).

Install Leaflet CSS in client entry.

### Files to create

```text
.gitignore
.env.example
README.md                          (minimal: how to install/run; expand Phase 10)
client/package.json
client/vite.config.js              (proxy /api and socket)
client/index.html
client/src/main.jsx
client/src/App.jsx
client/src/index.css               (Tailwind + CSS variables for light/dark tokens)
client/src/layouts/.gitkeep or AppLayout stub
client/src/pages/LandingPage.jsx   (static hero OK; polish Phase 10)
client/src/pages/NotFoundPage.jsx
client/src/routes/AppRouter.jsx
client/src/services/api.js         (axios instance, baseURL)
client/src/store/themeStore.js     (persist light/dark — used from Phase 1 so all later UI inherits)
client/src/constants/roles.js
client/src/utils/cn.js             (optional class merge)
server/package.json
server/server.js                   (listen, connect DB, attach Socket.IO placeholder)
server/config/db.js
server/config/env.js
server/middleware/errorHandler.js
server/middleware/notFound.js
server/sockets/index.js            (io init, connection log only)
server/utils/apiResponse.js
```

Empty folders per spec: `client/src/{assets,components,hooks,utils,constants}` and `server/{controllers,models,routes,services,validators,seed}`.

### Files to modify

None (greenfield).

### Backend APIs

`GET /api/health` → `{ success, data: { status: "ok" } }` for connectivity checks.

### Database models

None (connection only).

### Frontend pages

- `/` landing (structure only)
- `*` 404

No `/login` yet (Phase 2).

### Components

- `ThemeToggle` (so dark mode exists from day one)
- Optional `LoadingSkeleton` stub

### State management

- `themeStore`: `theme`, `toggleTheme`, persist `localStorage`

### Socket.IO events

Handshake only; no domain events.

### Testing requirements

- `npm run dev` in server: starts, connects Mongo (or fails clearly if `MONGO_URI` missing).
- `npm run dev` in client: Vite compiles, landing renders, theme toggle works.
- Health endpoint via curl/browser.
- Confirm proxy: client `/api/health` hits server.

### Exit criteria

Both apps start; folder structure matches spec; `.env.example` documented; no secrets committed.

---

# Phase 2 — Authentication and role management

**Goal:** Register, login, logout, JWT, bcrypt, `/api/auth/me`, profile update, protected React routes, role gates.

### Dependencies on previous phases

Phase 1 (server, axios, router, env, error handler).

### Dependencies (packages)

Already listed: `jsonwebtoken`, `bcryptjs`. Client: `react-hook-form`.

### Files to create

```text
server/models/User.js
server/controllers/authController.js
server/routes/authRoutes.js
server/middleware/auth.js          (requireAuth)
server/middleware/authorize.js     (requireRole(...roles))
server/validators/authValidators.js
server/utils/generateToken.js
client/src/pages/LoginPage.jsx
client/src/pages/RegisterPage.jsx
client/src/pages/UnauthorizedPage.jsx
client/src/layouts/AuthLayout.jsx
client/src/layouts/StudentLayout.jsx   (shell + Outlet; pages empty placeholders)
client/src/layouts/DriverLayout.jsx
client/src/layouts/AdminLayout.jsx
client/src/components/Navbar.jsx       (minimal)
client/src/components/Sidebar.jsx      (role links stub)
client/src/components/MobileNav.jsx
client/src/components/ProtectedRoute.jsx
client/src/components/RoleRoute.jsx
client/src/store/authStore.js
client/src/services/authService.js
client/src/hooks/useAuth.js
```

Placeholder pages so layouts work: `StudentDashboardPage`, `DriverDashboardPage`, `AdminDashboardPage` (copy “coming in later phase” is **not** allowed as fake buttons — use empty states: “Fleet map arrives in Phase 4”). Prefer real empty `EmptyState` with no dead CTAs.

### Files to modify

- `server/server.js` — mount `/api/auth`
- `client/src/routes/AppRouter.jsx` — public + role trees
- `client/src/services/api.js` — attach JWT, 401 → logout
- `client/src/App.jsx`

### Backend APIs

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Role STUDENT only (or allow role in body **only** for seed/admin later; hackathon: public register = STUDENT) |
| POST | `/api/auth/login` | Public | |
| POST | `/api/auth/logout` | Auth | Stateless JWT: client discards token; endpoint still exists |
| GET | `/api/auth/me` | Auth | |
| PUT | `/api/auth/profile` | Auth | name, phone, department, avatar URL, favorites later |

### Database models

**User:** `name`, `email` (unique, index), `password` (select: false), `role`, `studentId`, `department`, `phone`, `avatar`, `favoriteRoutes[]`, `favoriteStops[]`, `isActive`, timestamps.

Indexes: `{ email: 1 }`, `{ role: 1 }`.

### Frontend pages

`/login`, `/register`, `/unauthorized`, role layout shells at `/student/*`, `/driver/*`, `/admin/*` (dashboard placeholders).

### Components

`ProtectedRoute`, `RoleRoute`, `Navbar`, `Sidebar`, `MobileNav`, form inputs, `ErrorState` for 401/403.

### State management

`authStore`: `user`, `token`, `login`, `logout`, `fetchMe`, persist token (memory + `localStorage`).

### Socket.IO events

Pass JWT on connect (prepare in `sockets/index.js`; full rooms in Phase 4).

### Testing requirements

- Register student → login → `GET /me`.
- Wrong password 401.
- Access `/admin/dashboard` as student → unauthorized page.
- Inactive user cannot login (if `isActive` implemented).
- Password never returned in JSON.

### Exit criteria

JWT + role routing works; layouts exist; no admin APIs yet beyond auth.

---

# Phase 3 — Database models and CRUD

**Goal:** All spec models, admin-protected CRUD for shuttles/routes/stops, seed campus, driver–user link. Simulation **not** started yet; shuttles have static seed locations.

### Dependencies on previous phases

Phase 2 (User, `requireRole('ADMIN')`).

### Dependencies (packages)

None new. Optionally `express-validator` or keep custom validators.

### Files to create

**Models**

```text
server/models/Shuttle.js
server/models/Route.js
server/models/Stop.js
server/models/Driver.js
server/models/Trip.js
server/models/Ride.js
server/models/Notification.js
server/models/Alert.js
server/models/EmergencyReport.js
server/models/BreakdownReport.js
server/models/Prediction.js
server/models/QRPass.js
server/models/Settings.js          (crowd thresholds, breakdown idle minutes — used Phases 5–7)
```

**CRUD**

```text
server/controllers/shuttleController.js
server/controllers/routeController.js
server/controllers/stopController.js
server/controllers/driverController.js
server/controllers/userAdminController.js
server/routes/shuttleRoutes.js
server/routes/routeRoutes.js
server/routes/stopRoutes.js
server/routes/driverRoutes.js
server/routes/userRoutes.js
server/validators/shuttleValidators.js
server/validators/routeValidators.js
server/validators/stopValidators.js
server/seed/index.js
server/seed/campus.js              (15+ stops, 5 routes, mock lat/lng)
server/seed/users.js
client/src/pages/admin/ShuttlesPage.jsx
client/src/pages/admin/RoutesPage.jsx
client/src/pages/admin/StopsPage.jsx
client/src/pages/admin/DriversPage.jsx
client/src/pages/admin/UsersPage.jsx
client/src/pages/student/RoutesPage.jsx
client/src/pages/student/ProfilePage.jsx  (favorites wire to User)
client/src/components/ShuttleCard.jsx
client/src/components/RouteCard.jsx
client/src/components/StopCard.jsx
client/src/components/Modal.jsx
client/src/components/EmptyState.jsx
client/src/services/shuttleService.js
client/src/services/routeService.js
client/src/services/stopService.js
```

### Files to modify

- `server/server.js` — mount CRUD routes
- Admin `Sidebar` links
- `User` model if Driver needs `user` ref (Driver.user → User with role DRIVER)

### Backend APIs

| Resource | Methods | Roles |
| --- | --- | --- |
| `/api/shuttles` | GET all/one (auth), POST/PUT/DELETE (ADMIN) | Students GET for later map |
| `/api/routes` | same pattern | |
| `/api/stops` | same | |
| Drivers | `/api/drivers` CRUD ADMIN; GET assigned for DRIVER self | |
| Users | GET list/search/filter, PATCH activate ADMIN; never password | |

Spec lists shuttle/route/stop/alert/prediction/analytics/rides/notifications/emergency/QR. **This phase implements shuttle, route, stop, driver, user list.** Alerts+ later phases. Stub 501 is forbidden — do not mount unused routes until implemented.

**Suggested extra (needed by spec, not in §51 list):**

- `GET/PUT /api/drivers/:id`  
- `GET /api/users` (admin)  
- `PUT /api/users/:id/status`

Document extras in README Phase 10.

### Database models (fields)

Align with spec §§11–14 plus:

- **Shuttle:** refs `route`, `driver`; `currentLocation: { lat, lng }`; `currentStop`, `nextStop`; `speed`; `passengerCount`; `crowdLevel`; `status`; `lastUpdated`; indexes on `shuttleId`, `status`, `route`.
- **Route:** `stops: [{ type ObjectId, ref Stop }]` ordered; `estimatedDuration`; `active`.
- **Stop:** geo fields; `facilities[]`; `active`; optional `2dsphere` index on `{ longitude, latitude }` or GeoJSON `location`.
- **Driver:** `user`, `licenseNumber`, `isActive`, `assignedShuttle`.
- **Trip:** `shuttle`, `route`, `driver`, `startedAt`, `endedAt`, `status`.
- **Ride:** student, shuttle, route, boardingStop, destination, timestamps (populated Phase 8).
- **Notification / Alert / Emergency / Breakdown / Prediction / QRPass:** schemas now; writes in later phases so seed can insert sample alerts/history.

**Settings:** `crowdLowMax`, `crowdMediumMax`, `breakdownIdleMinutes`, `simulationTickMs`.

### Frontend pages

Admin CRUD tables + forms. Student routes list (read-only). Profile favorites (PUT profile).

### Components

Cards, Modal, table + mobile stacked rows, `LoadingSkeleton`.

### State management

Optional `catalogStore` for routes/stops cache. Keep server as source of truth.

### Socket.IO events

None required.

### Testing requirements

- Seed: 5 routes, 15+ stops, 5–8 shuttles, drivers, students, sample rides/crowd history/alerts.
- Admin create/edit/delete stop and route reorder.
- Assign driver ↔ shuttle.
- Student GET shuttles; cannot POST.
- Indexes: explain unique `shuttleId`, unique `email`.

### Exit criteria

Seed makes the app usable; CRUD works; models exist for later phases.

---

# Phase 4 — Maps and shuttle simulation

**Goal:** Leaflet map, polylines, markers, backend tick loop, Socket.IO live locations, admin start/pause/reset. Multiple shuttles move without teleporting.

### Dependencies on previous phases

Phase 3 (shuttles, routes, stops, seed coordinates).

### Dependencies (packages)

Client: `leaflet`, `react-leaflet` (already in Phase 1). Server: none (or `geolib` only if it avoids custom haversine — prefer small `utils/geo.js` to skip extra deps).

### Files to create

```text
server/services/geoService.js              (haversine, interpolate, bearing)
server/services/simulationService.js       (tick, start, pause, reset, injectDelay, injectBreakdown, injectCrowd)
server/services/shuttleStateService.js     (in-memory map + persist)
server/controllers/simulationController.js
server/routes/simulationRoutes.js
server/sockets/shuttleSocket.js            (emit helpers)
server/sockets/rooms.js
client/src/pages/student/MapPage.jsx
client/src/pages/student/DashboardPage.jsx (map + empty slots for later widgets)
client/src/pages/admin/LiveMapPage.jsx
client/src/pages/admin/SettingsPage.jsx    (simulation controls section)
client/src/components/map/ShuttleMap.jsx
client/src/components/map/ShuttleMarker.jsx
client/src/components/map/StopMarker.jsx
client/src/components/map/RouteLine.jsx
client/src/components/map/UserLocationMarker.jsx
client/src/hooks/useSocket.js
client/src/hooks/useShuttleSimulation.js   (subscribe to location/update)
client/src/store/shuttleStore.js
client/src/store/socketStore.js            (connection status)
client/src/utils/mapIcons.js
client/src/constants/shuttleStatus.js
```

### Files to modify

- `server/sockets/index.js` — JWT, join `fleet` / `admin`
- `server/server.js` — start io, optional don’t auto-start sim
- `Shuttle` model if simulation needs `heading`, `segmentIndex` (can stay in-memory only)
- Admin dashboard placeholder → live counts from GET shuttles
- Driver dashboard: assigned shuttle location (read)

### Backend APIs

| Method | Path | Role |
| --- | --- | --- |
| POST | `/api/simulation/start` | ADMIN |
| POST | `/api/simulation/pause` | ADMIN |
| POST | `/api/simulation/reset` | ADMIN |
| POST | `/api/simulation/delay` | ADMIN body `{ shuttleId }` |
| POST | `/api/simulation/breakdown` | ADMIN |
| POST | `/api/simulation/high-crowd` | ADMIN |
| GET | `/api/simulation/status` | ADMIN |

Driver trip start/end can set shuttle `status` and create `Trip` (minimal here; full passenger UI Phase 5):

| POST | `/api/trips/start` | DRIVER |
| POST | `/api/trips/end` | DRIVER |

If trip routes wait for Phase 5, driver “start trip” may only flip status `ON_TIME` via `PUT /api/shuttles/:id` restricted to assigned driver — prefer dedicated trip endpoints to match driver dashboard.

### Database models

No new collections. Updates to `Shuttle.lastUpdated`, location, status. `Trip` documents on start/end.

### Frontend pages

`/student/map`, student dashboard map pane, `/admin/live-map`, settings simulation buttons (real).

Landing page map: optional live `fleet` if public socket allowed; otherwise static seed preview. Spec wants attractive mock/live map — authenticated live map on student home is enough; landing can show a non-interactive screenshot-style map or the same map in read-only if health allows.

### Components

`ShuttleMap`, `ShuttleMarker` (popup: id, route, stops, speed, passengers, crowd, status — ETA may show “—” until Phase 5), `StopMarker`, `RouteLine`, user/mock location.

### State management

`shuttleStore`: `shuttlesById`, `applyLocation`, `applyUpdate`, `setFleet` (initial REST fetch).

### Socket.IO events

| Event | Payload (min) | When |
| --- | --- | --- |
| `shuttle:location` | id, lat, lng, heading, speed, ts | every tick |
| `shuttle:update` | fuller shuttle DTO | stop change / throttle |
| `shuttle:status` | id, status | status change |

Client map: **only** move marker on `shuttle:location`; do not remount map.

### Testing requirements

- Start sim → 5–8 markers move along polylines.
- Pause → freeze; start → resume.
- Reset → back to seed positions.
- Network tab: location events fire; REST GET still consistent after throttle persist.
- Two browsers: student map + admin live map both move.
- No teleport (watch one shuttle between two stops).
- Single socket connection on navigate map ↔ dashboard.

### Exit criteria

Demo steps 4–5 (simulation + moving markers) work.

---

# Phase 5 — ETA, crowd monitoring, and trip planner

**Goal:** Dynamic ETA, occupancy/crowd from counts + configurable thresholds, nearest stop, trip planner list (recommendation highlight can be Phase 6; this phase can sort by ETA only and leave “BEST” to Phase 6 — spec trip planner highlights recommended option: **compute simple ETA sort now**, swap to recommendation engine in Phase 6 without changing the page).

### Dependencies on previous phases

Phase 4 (live location, speed, route geometry).

### Dependencies (packages)

None.

### Files to create

```text
server/services/etaService.js
server/services/crowdService.js
server/services/nearestStopService.js
server/controllers/plannerController.js
server/routes/plannerRoutes.js
server/controllers/settingsController.js
server/routes/settingsRoutes.js
client/src/pages/student/TripPlannerPage.jsx
client/src/components/ETAIndicator.jsx
client/src/components/CrowdBadge.jsx
client/src/components/OccupancyBar.jsx
client/src/components/StopCard.jsx          (if not complete)
client/src/hooks/useGeolocation.js          (real GPS + mock picker)
client/src/store/locationStore.js           (mock demo coordinates)
client/src/pages/driver/DashboardPage.jsx
client/src/pages/driver/ShuttlePage.jsx
client/src/pages/driver/TripPage.jsx
client/src/services/plannerService.js
```

### Files to modify

- `simulationService.js` — call eta + crowd each tick; include ETAs on `shuttle:update`
- `Settings` admin form: crowd thresholds
- `ShuttleMarker` popup: live ETA, crowd, occupancy
- Student dashboard stats: nearest shuttle, next arrival, current crowd, favorite route
- `PUT` shuttle passenger count from driver

### Backend APIs

| Method | Path | Role |
| --- | --- | --- |
| GET | `/api/planner/trip?from=&to=` | STUDENT |
| GET | `/api/stops/nearest?lat=&lng=` | Auth |
| GET | `/api/settings` | ADMIN |
| PUT | `/api/settings` | ADMIN |
| PATCH | `/api/shuttles/:id/passengers` | DRIVER (assigned) |

`GET /api/shuttles` should include computed `etaToNextStop`, `occupancyPercentage`, `crowdLevel`.

### Database models

`Settings` used. Shuttle crowd fields updated by simulation/driver.

### Frontend pages

`/student/trip-planner`, driver trip + shuttle pages with passenger control, nearest stop CTA on dashboard/map.

### Components

`ETAIndicator`, `CrowdBadge`, `OccupancyBar`, mock location selector modal.

### State management

`locationStore` mock lat/lng. Shuttle store already holds ETA/crowd from sockets.

### Socket.IO events

`shuttle:crowd` when crowd **band** changes (LOW→MEDIUM etc.). Location ticks do not re-emit crowd unless band or passenger count changed.

### Testing requirements

- ETA decreases as shuttle approaches; “Arriving” at stop; then new next-stop ETA.
- Occupancy 24/40 → 60% → MEDIUM with default thresholds.
- Admin changes thresholds → crowd badges change without code edit.
- Nearest stop distance + walking time (~80 m/min walk).
- Trip planner Hostel → Library returns only compatible shuttles with ETAs.
- Driver passenger update reflects on student map via socket.

### Exit criteria

Hackathon cores 2–3 (ETA, crowd) work on live data.

---

# Phase 6 — AI crowd prediction and smart recommendation

**Goal:** Isolated prediction service + `GET /api/predictions/crowd/:routeId`; recommendation engine used by trip planner and dashboard; admin predictions page can be a simple table (full analytics Phase 9).

### Dependencies on previous phases

Phase 5 (live crowd, trip from/to, historical seed rides).

### Dependencies (packages)

None (no TensorFlow).

### Files to create

```text
server/services/predictionService.js
server/services/recommendationService.js
server/controllers/predictionController.js
server/routes/predictionRoutes.js
server/seed/crowdHistory.js                 (if not in Phase 3 seed)
client/src/pages/admin/PredictionsPage.jsx
client/src/components/RecommendationCard.jsx
client/src/pages/student/RoutesPage.jsx     (per-route prediction strip)
```

### Files to modify

- `plannerController` — attach `recommended: true`, `reason` from recommendationService
- Student dashboard recommended widget
- Trip planner highlight BEST OPTION
- `Prediction` model writes on demand or cron-less on GET

### Backend APIs

| GET | `/api/predictions/crowd/:routeId` | Auth |
| POST | `/api/planner/recommend` | STUDENT body `{ fromStopId, toStopId }` |

Planner GET from Phase 5 should be upgraded to include recommendation fields (same URL, richer `data`).

### Database models

**Prediction:** `route`, `stop` (optional), `slotStart`, `predictedCrowd`, `predictedOccupancy`, `generatedAt`, source: `TREND_V1`.

### Frontend pages

Admin `/admin/predictions`. Student trip planner + dashboard card. Optional student route detail.

### Components

`RecommendationCard` (star best option, reason text). Prediction table/timeline.

### State management

No global AI store required; fetch on page load. Optional cache in `predictionStore`.

### Socket.IO events

None required. Optional later: `prediction:updated` — skip to avoid scope creep.

### Testing requirements

- Same from/to at different simulated crowd/ETA → **different** best shuttle (not hardcoded S02).
- Prediction table varies by route and time buckets; uses seed history.
- UI copy does not say “neural network” / “trained model”.
- Empty history fallback: still returns LOW/MEDIUM based on current occupancy trend.

### Exit criteria

Demo steps 8–9 work.

---

# Phase 7 — Notifications, alerts, breakdowns, and emergencies

**Goal:** Alert CRUD + socket, notification center, delay/crowd/breakdown/emergency notifications, idle-based breakdown detection, student/driver emergency reports, admin queues.

### Dependencies on previous phases

Phase 4–5 (simulation, status, crowd). Phase 2 auth for targeting users.

### Dependencies (packages)

None.

### Files to create

```text
server/services/notificationService.js
server/services/breakdownDetectionService.js
server/controllers/alertController.js
server/controllers/notificationController.js
server/controllers/emergencyController.js
server/controllers/breakdownController.js
server/routes/alertRoutes.js
server/routes/notificationRoutes.js
server/routes/emergencyRoutes.js
server/routes/breakdownRoutes.js
client/src/pages/student/NotificationsPage.jsx
client/src/pages/admin/AlertsPage.jsx
client/src/pages/admin/EmergenciesPage.jsx
client/src/pages/admin/BreakdownsPage.jsx
client/src/pages/driver/ReportPage.jsx
client/src/components/AlertCard.jsx
client/src/components/NotificationPanel.jsx
client/src/components/Toast.jsx
client/src/store/notificationStore.js
client/src/services/alertService.js
client/src/services/notificationService.js
```

### Files to modify

- `simulationService` — on DELAYED / HIGH crowd / breakdown inject → notifications
- `breakdownDetectionService` hooked into tick (stationary > Settings.breakdownIdleMinutes)
- Navbar bell + unread count
- Student dashboard active alerts
- Socket rooms `user:{id}`, `admin`

### Backend APIs

| Method | Path | Role |
| --- | --- | --- |
| GET/POST/PUT/DELETE | `/api/alerts` | GET auth; mutations ADMIN |
| GET | `/api/notifications` | Auth (own) |
| PUT | `/api/notifications/:id/read` | Auth |
| PUT | `/api/notifications/read-all` | Auth |
| POST | `/api/emergency` | STUDENT, DRIVER |
| GET | `/api/emergency` | ADMIN (own GET student optional) |
| PUT | `/api/emergency/:id` | ADMIN status |
| GET | `/api/breakdowns` | ADMIN |
| PUT | `/api/breakdowns/:id` | ADMIN resolve / disable shuttle / notify |

Notification types: `ARRIVAL`, `DELAY`, `ROUTE_CHANGE`, `CROWD_WARNING`, `BREAKDOWN`, `EMERGENCY`, `SERVICE_ALERT`.

Alert fields per spec: title, description, route, severity INFO/WARNING/CRITICAL, start/end, active.

Emergency: type enum, description, shuttle, location, createdBy, priority, status OPEN/IN_PROGRESS/RESOLVED. Disclaimer: not a replacement for emergency services.

### Database models

Use Alert, Notification, EmergencyReport, BreakdownReport. Indexes: `{ user, read, createdAt }`, `{ active, endTime }` on alerts.

### Frontend pages

Student notifications; driver report; admin alerts/emergencies/breakdowns. Critical styling for OPEN emergencies.

### Components

`AlertCard`, `NotificationPanel`, `Toast` on `notification:new` / `alert:new`.

### State management

`notificationStore`: list, unread, `markRead`. Socket appends.

### Socket.IO events

| Event | Room | Payload |
| --- | --- | --- |
| `alert:new` | `fleet` | alert DTO |
| `notification:new` | `user:{id}` | notification DTO |
| `emergency:new` | `admin` | report DTO |
| `breakdown:new` | `admin` + optional fleet notify | report DTO |

### Testing requirements

- Admin creates alert → students see banner + socket without refresh.
- Simulate delay → DELAY notification.
- High crowd → CROWD_WARNING.
- Idle shuttle → breakdown report + admin UI.
- Admin resolve breakdown, disable shuttle, notify students.
- Emergency disclaimer visible.
- Mark read / read all.

### Exit criteria

Demo steps 13–15; core requirement 4 (service alerts).

---

# Phase 8 — QR boarding pass, ride history, and carbon savings

**Goal:** Full ride loop: generate pass → driver verify → Ride row → history + carbon.

### Dependencies on previous phases

Phase 3 models; Phase 5/6 trip destination; Phase 2 users.

### Dependencies (packages)

Client: `qrcode.react` (or `qrcode` to render canvas). Driver scanner: `html5-qrcode` or file/camera; fallback **manual pass ID entry** so demo works without camera.

### Files to create

```text
server/services/qrService.js
server/services/carbonService.js
server/controllers/qrController.js
server/controllers/rideController.js
server/routes/qrRoutes.js
server/routes/rideRoutes.js
client/src/pages/student/QrPassPage.jsx
client/src/pages/student/RidesPage.jsx
client/src/pages/driver/ScanPassPage.jsx
client/src/components/QRPass.jsx
client/src/utils/carbon.js                 (display only; logic server)
```

### Files to modify

- Student dashboard stats (rides this month, CO₂)
- Seed historical rides for charts later

### Backend APIs

| POST | `/api/qr/generate` | STUDENT `{ routeId, destinationStopId? }` |
| POST | `/api/qr/verify` | DRIVER `{ passId }` or `{ token }` |
| GET | `/api/rides/my` | STUDENT |
| POST | `/api/rides` | Prefer **only via verify** to avoid fake rides; if POST exists, DRIVER/ADMIN only |

Verify checks: pass exists, valid, date, student, route. Returns VALID / INVALID.

On success: create Ride, increment carbon, invalidate or mark QR used (one-time per trip recommended).

**Carbon assumptions (document in README):** e.g. 0.3 kg CO₂ saved per ride vs solo car, mock constant. Label “estimated”.

### Database models

**QRPass:** `passId`, `student`, `route`, `date`, `expiresAt`, `usedAt`, `valid`.  
**Ride:** student, shuttle, route, boardingStop, destination, boardedAt.

### Frontend pages

`/student/qr-pass`, `/student/rides`, `/driver/scan-pass`.

### Components

`QRPass` card (name, studentId, route, date, passId + QR).

### State management

None global required.

### Socket.IO events

Optional `ride:created` to student for live history — nice-to-have; REST refetch on focus is enough.

### Testing requirements

- Generate pass → QR visible.
- Verify valid vs expired vs wrong route.
- History groups Today / Yesterday.
- Carbon weekly/monthly/total updates after verify.
- Cannot complete flow with a fake UI-only button.

### Exit criteria

Demo steps 10–12.

---

# Phase 9 — Admin dashboard and analytics

**Goal:** Real dashboard cards, Recharts from DB, AI insights from analytics+predictions, search, remaining admin nav, driver activity.

### Dependencies on previous phases

Rides, shuttles, alerts, emergencies, predictions, carbon.

### Dependencies (packages)

`recharts` (client, Phase 1).

### Files to create

```text
server/services/analyticsService.js
server/services/insightsService.js
server/controllers/analyticsController.js
server/routes/analyticsRoutes.js
server/controllers/searchController.js
server/routes/searchRoutes.js
client/src/pages/admin/DashboardPage.jsx
client/src/pages/admin/AnalyticsPage.jsx
client/src/components/StatCard.jsx
client/src/components/AnalyticsChart.jsx
client/src/components/SearchModal.jsx
client/src/layouts/AdminLayout.jsx         (complete sidebar)
```

### Files to modify

- Navbar global search
- Insights panel on admin dashboard and/or analytics

### Backend APIs

| GET | `/api/analytics/dashboard` | ADMIN cards: active shuttles, students, today’s rides, delayed, high-crowd routes, open alerts |
| GET | `/api/analytics/rides` | query `range`, `routeId`, `shuttleId` |
| GET | `/api/analytics/crowd` | |
| GET | `/api/analytics/routes` | |
| GET | `/api/analytics/insights` | generated text array |
| GET | `/api/search?q=` | Auth — shuttles, routes, stops, alerts |

Extra analytics series as needed: occupancy, waiting time (estimate from ETA samples if stored; else derive from ride boarding vs sim — keep simple: average ETA at stop from recent `shuttle:update` logs **or** seed-based delay chart from Ride/Alert DELAY counts). Prefer metrics that exist: ride counts, occupancy snapshots if you persist hourly rollups in seed + live increment.

Do not hardcode card numbers.

### Database models

Optional `AnalyticsSnapshot` — only if querying raw rides is too slow; start with aggregations on Ride/Shuttle/Alert.

### Frontend pages

`/admin/dashboard`, `/admin/analytics`, settings already have sim + thresholds. Predictions page from Phase 6 polish.

### Components

`StatCard`, `AnalyticsChart` (line, bar, area), filters Today / 7d / 30d, route/shuttle.

### State management

Fetch on filter change.

### Socket.IO events

Dashboard cards: poll or patch on `shuttle:status` / `alert:new` for live delayed/alert counts.

### Testing requirements

- Seed rides → charts non-empty.
- Filter 7 days changes series.
- Insights mention real route names from data.
- Search “Library” returns stop, routes, shuttles.
- Student cannot GET analytics.

### Exit criteria

Demo step 16; admin questions in spec §4 answerable.

---

# Phase 10 — Final UI/UX polish, testing, and documentation

**Goal:** Landing polish, Framer Motion tastefully, responsive + a11y, 404/unauthorized, README, socket event docs, demo credentials, definition-of-done pass. No new major features.

### Dependencies on previous phases

All feature phases.

### Dependencies (packages)

`framer-motion` already installed — apply to landing, cards, toasts. No extra UI kits.

### Files to create

```text
README.md                                  (complete)
client/src/pages/LandingPage.jsx           (full spec §44)
client/src/components/ErrorState.jsx       (if incomplete)
docs not required if README covers APIs + sockets
server/seed/README or seed output prints demo password once
```

### Files to modify

Every layout/page: spacing, empty/error/loading, dark mode gaps, mobile sidebar, map height on mobile, tables → cards on small screens, contrast, labels, ARIA on icon buttons.

### Backend APIs

None new. Audit status codes and envelopes.

### Database models

None.

### Frontend pages

All routes in spec §50 must exist and work. Footer, How it Works, CTA on landing.

### Components

Audit reusable list in spec §49 — fill any missing; no duplication.

### State management

Audit socket singleton; no extra connections.

### Socket.IO events

Document in README:

```text
shuttle:location
shuttle:update
shuttle:status
shuttle:crowd
alert:new
notification:new
emergency:new
breakdown:new
```

### Testing requirements (definition of done §66)

Manual checklist:

- Frontend build, backend start, Mongo connect
- Auth + roles
- Three dashboards
- Map + multi-shuttle sim + dynamic ETA + crowd
- Prediction + recommendation + nearest stop + trip planner
- Notifications, alerts, breakdowns, emergencies
- QR generate/verify, history, carbon
- Analytics + admin CRUD
- Sockets without refresh
- Responsive + dark mode
- Error/loading/empty
- Seed + demo logins
- No critical console errors
- Emergency feature disclaimer
- Prediction labeled trend-based
- Carbon labeled estimate

Hackathon demo flow §62 run end-to-end once.

Automated (practical for hackathon):

- Server: a few unit tests for `etaService`, `crowdService`, `recommendationService` (Node `node:test` or Jest if added — **prefer `node:test`** to avoid extra deps unless already using Jest).
- Optional Playwright later — not required if timeboxed.

### Exit criteria

Spec §66 and §67. Agent reports Implemented / Tested / Issues / Remaining. **Do not auto-start another phase.**

---

## Cross-cutting implementation notes

### Driver vs Student vs Admin UI completeness by phase

| Surface | Introduced |
| --- | --- |
| Auth + shells | P2 |
| Admin CRUD | P3 |
| Maps + sim | P4 |
| Driver ops + planner + ETA/crowd | P5 |
| Prediction + recommend | P6 |
| Alerts/notif/emergency/breakdown | P7 |
| QR + rides + carbon | P8 |
| Analytics + search + insights | P9 |
| Landing + polish | P10 |

### Favorite routes/stops

Model in P2/P3; UI on profile P3; used as dashboard “Favorite Route” P5.

### Global search

API + UI P9 (spec §41). Navbar search input can appear earlier as disabled — **do not**: that is a fake control. Add search in P9 only.

### Light/dark

Theme tokens P1; verify every new component.

### Security (all API phases)

Validate/sanitize inputs; CORS; JWT on mutations; role middleware; no plaintext passwords; `.env` gitignored.

---

## Suggested seed campus (for implementers)

Circular **Hostel Route:** Hostel → Main Gate → CSE Block → Library → Cafeteria → Hostel.  
Plus four more: Academic, Hostel Express, Sports, Night (or similar names), 15+ unique stops in a tight lat/lng box (e.g. a fictional campus around a real OSM area so tiles look like a campus).

Shuttles S01–S08 assigned across routes, staggered `segmentIndex` so the demo looks busy immediately after START.

---

## Phase execution rule (agents)

```text
READ SPEC → PLAN THIS PHASE → IMPLEMENT → RUN → TEST → FIX → VERIFY → REPORT
```

After each phase report:

```text
Implemented:
Tested:
Issues found:
Issues fixed:
Remaining:
```

Wait for an explicit request before the next phase.
