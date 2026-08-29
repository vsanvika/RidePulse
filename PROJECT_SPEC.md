# RidePulse — Project Specification

**Project Name:** RidePulse
**Project Type:** Smart Campus Shuttle Tracking & Intelligence Platform
**Target:** College Hackathon
**Development Approach:** Full-stack, modular, production-quality, demo-ready

---

# 1. PROJECT OVERVIEW

RidePulse is a smart campus transportation platform that helps students track campus shuttles, view estimated arrival times, monitor current and predicted crowd levels, find nearby shuttle stops, receive service alerts, and choose the best shuttle for their journey.

The application also provides administrators with a real-time transportation management dashboard containing shuttle monitoring, route management, analytics, crowd predictions, alerts, emergency reports, breakdown detection, and fleet management.

The project must be a **fully functional full-stack application**, not a static UI prototype.

The application will use simulated campus shuttle GPS data so that the project can operate without physical GPS hardware or paid external APIs.

---

# 2. HACKATHON CORE REQUIREMENTS

RidePulse must implement these four core requirements:

1. Show shuttle location on a map.
2. Display estimated arrival time.
3. Show crowd level: Low, Medium, or High.
4. Post service alerts or delays.

These are the foundational features of RidePulse.

---

# 3. EXTENDED FEATURES

In addition to the core requirements, implement:

1. Real-time shuttle tracking
2. Multiple shuttle tracking
3. Dynamic ETA calculation
4. Live crowd monitoring
5. AI-based crowd prediction
6. Smart shuttle recommendation
7. Route planner
8. Nearest shuttle stop
9. Smart notifications
10. Service alerts
11. Shuttle delay simulation
12. Shuttle breakdown detection
13. Emergency reporting
14. Admin dashboard
15. Driver dashboard
16. Shuttle management
17. Route management
18. Stop management
19. Driver management
20. User management
21. QR digital boarding pass
22. QR pass verification
23. Student ride history
24. Carbon savings tracker
25. Transportation analytics
26. AI-generated transportation insights
27. Demo/simulation mode
28. Light/dark mode
29. Responsive mobile UI

---

# 4. PRODUCT GOAL

The student should be able to answer:

* Where is my shuttle?
* When will it arrive?
* How crowded is it?
* Will it become crowded soon?
* Which shuttle should I take?
* Where is the nearest stop?
* Is my route delayed?
* Has there been a service disruption?
* What are my previous rides?
* How much transportation-related carbon have I saved?

The administrator should be able to answer:

* Where are all active shuttles?
* Which routes are crowded?
* Which shuttles are delayed?
* Are any shuttles potentially broken down?
* How many rides occurred today?
* Which routes are most used?
* When are peak travel hours?
* What does the crowd prediction indicate?
* Are there emergency reports?
* Should additional shuttle capacity be considered?

---

# 5. TECHNOLOGY STACK

## Frontend

Use:

* React.js
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Axios
* Zustand
* React Hook Form
* Recharts
* Leaflet
* React Leaflet
* Socket.IO Client
* Lucide React
* Framer Motion
* QR code library

Do NOT use Bootstrap.

Do NOT build the main UI with plain CSS.

Tailwind CSS must be the primary styling system.

---

## Backend

Use:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Socket.IO
* REST APIs

Use modular architecture.

---

## Database

Use MongoDB.

Use Mongoose models and references.

---

# 6. ARCHITECTURE

Use a clean client/server architecture.

```text
                    RidePulse
                       |
          ┌────────────┴────────────┐
          │                         │
       Frontend                  Backend
          │                         │
       React                    Express
          │                         │
      Tailwind                  REST APIs
          │                         │
       Zustand                  Services
          │                         │
      Leaflet                    MongoDB
          │                         │
    Socket.IO Client          Socket.IO Server
          │                         │
          └────────────┬────────────┘
                       │
                Shuttle Simulation
                       │
                Prediction Service
                       │
              Recommendation Engine
```

---

# 7. PROJECT STRUCTURE

Use this structure:

```text
ridepulse/
│
├── PROJECT_SPEC.md
├── DEVELOPMENT_PLAN.md
├── README.md
├── .gitignore
├── .env.example
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── store/
│       ├── utils/
│       ├── constants/
│       ├── routes/
│       ├── App.jsx
│       └── main.jsx
│
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── sockets/
    ├── utils/
    ├── seed/
    ├── validators/
    └── server.js
```

Do not create unnecessary folders.

Keep responsibilities separated.

---

# 8. USER ROLES

RidePulse has three roles.

## STUDENT

Students can:

* Register
* Login
* Logout
* View dashboard
* Track shuttles
* View map
* Search routes
* Search stops
* Plan trips
* View ETA
* View crowd level
* View predicted crowd
* Receive notifications
* Save favorite routes
* Save favorite stops
* Find nearest stop
* Generate QR boarding pass
* View ride history
* View carbon savings
* Report emergency
* Report shuttle issue
* View service alerts
* Manage profile

---

## DRIVER

Drivers can:

* Login
* View assigned shuttle
* View assigned route
* Start trip
* End trip
* Update passenger count
* Update shuttle status
* Report delay
* Report breakdown
* Trigger emergency report
* View QR scanner
* Verify boarding passes

---

## ADMIN

Admins can:

* Login
* View dashboard
* View all active shuttles
* View live map
* Manage shuttles
* Manage routes
* Manage stops
* Manage drivers
* Manage students
* Create alerts
* View emergency reports
* View breakdown reports
* View analytics
* View crowd predictions
* View AI insights
* Start simulation
* Pause simulation
* Reset simulation
* Simulate delays
* Simulate breakdowns
* Configure crowd thresholds
* Manage settings

---

# 9. AUTHENTICATION

Implement:

* Registration
* Login
* Logout
* JWT authentication
* Password hashing
* Current-user endpoint
* Profile update
* Protected routes
* Role-based authorization

Frontend routes:

```text
/login
/register

/student/*
/driver/*
/admin/*
```

Unauthorized users must not access protected pages.

Students must not access admin functionality.

Drivers must not access admin functionality.

---

# 10. DATABASE MODELS

Create the following models:

```text
User
Shuttle
Route
Stop
Driver
Trip
Ride
Notification
Alert
EmergencyReport
BreakdownReport
Prediction
QRPass
```

Use timestamps.

Use appropriate indexes.

Use references between related collections.

---

# 11. USER MODEL

Suggested fields:

```text
name
email
password
role
studentId
department
phone
avatar
favoriteRoutes
favoriteStops
createdAt
updatedAt
```

Roles:

```text
STUDENT
DRIVER
ADMIN
```

Never store plaintext passwords.

---

# 12. SHUTTLE MODEL

Suggested fields:

```text
shuttleId
vehicleNumber
capacity
route
driver
currentLocation
currentStop
nextStop
speed
passengerCount
crowdLevel
status
lastUpdated
```

Statuses:

```text
ON_TIME
DELAYED
STOPPED
BREAKDOWN
COMPLETED
OFFLINE
```

Crowd levels:

```text
LOW
MEDIUM
HIGH
```

---

# 13. ROUTE MODEL

Suggested fields:

```text
name
description
stops
estimatedDuration
active
```

A route contains an ordered list of stops.

Example:

```text
Hostel
→ Main Gate
→ CSE Block
→ Library
→ Cafeteria
→ Hostel
```

---

# 14. STOP MODEL

Suggested fields:

```text
name
latitude
longitude
description
facilities
active
```

Facilities may include:

```text
Waiting Area
Water
Parking
Accessibility
```

Use mock campus coordinates.

---

# 15. LIVE SHUTTLE TRACKING

The map is one of the most important parts of RidePulse.

Use:

* Leaflet
* React Leaflet
* OpenStreetMap

Display:

* Shuttle markers
* Stop markers
* Route lines
* Current user/mock location

Clicking a shuttle displays:

```text
Shuttle S01
Route: Hostel Route

Current Stop: Main Gate
Next Stop: CSE Block

ETA: 4 minutes

Speed: 25 km/h

Passengers: 22 / 40

Crowd: MEDIUM

Status: ON TIME
```

---

# 16. SHUTTLE SIMULATION

Because physical GPS hardware is not required, create a realistic simulation.

Create multiple predefined routes.

Example:

```text
Hostel
↓
Main Gate
↓
CSE Block
↓
Library
↓
Cafeteria
↓
Hostel
```

The simulated shuttle must:

* Move gradually
* Update coordinates
* Update speed
* Update current stop
* Update next stop
* Update ETA
* Update passenger count
* Update crowd level
* Simulate delays
* Simulate stops
* Simulate breakdowns

Do NOT teleport shuttle markers between stops.

The shuttle marker should visibly move along the route.

---

# 17. REAL-TIME COMMUNICATION

Use Socket.IO.

Events:

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

The student and admin dashboards must update without manually refreshing the page.

---

# 18. ETA SYSTEM

ETA should be dynamically calculated.

Inputs:

* Current location
* Next stop
* Distance
* Speed
* Route
* Delay

Basic calculation:

```text
ETA = Remaining Distance / Effective Speed
```

When the shuttle moves:

```text
10 min
↓
8 min
↓
6 min
↓
4 min
↓
2 min
↓
Arriving
```

When a shuttle reaches a stop:

* Current stop changes
* Next stop changes
* ETA recalculates

---

# 19. CROWD MONITORING

Calculate occupancy:

```text
occupancyPercentage =
(passengerCount / capacity) × 100
```

Default thresholds:

```text
0–40%   → LOW
41–75%  → MEDIUM
76–100% → HIGH
```

These thresholds must be configurable by the admin.

Display:

```text
24 / 40 passengers

60% occupied

MEDIUM
```

Use a visual occupancy bar.

---

# 20. AI CROWD PREDICTION

Create a modular prediction service.

Prediction inputs:

* Time
* Day
* Route
* Stop
* Historical passenger count
* Occupancy
* Peak hours

Output:

```text
Time       Predicted Crowd
8:00 AM    MEDIUM
8:30 AM    HIGH
9:00 AM    HIGH
9:30 AM    MEDIUM
10:00 AM   LOW
```

Create:

```text
GET /api/predictions/crowd/:routeId
```

Use sample historical data.

The initial implementation may use a trend-based/statistical prediction algorithm.

Keep the prediction service isolated so a real ML model can replace it later.

Do not claim that a real trained AI model exists if the implementation is rule/trend-based.

---

# 21. SMART SHUTTLE RECOMMENDATION

When the user enters:

```text
From: Hostel
To: Library
```

Compare available shuttles using:

* ETA
* Crowd
* Delay
* Route compatibility
* Destination arrival time

Return a recommendation.

Example:

```text
⭐ BEST OPTION

Shuttle S02

ETA: 3 min
Crowd: LOW
Destination Arrival: 9:18 AM

Reason:
Fastest available shuttle with low crowd.
```

The recommendation must be calculated from current data.

Do not hardcode the recommended shuttle.

---

# 22. NEAREST STOP

Calculate nearest stop using coordinates.

Display:

```text
Nearest Stop

CSE Block

Distance:
250 m

Walking Time:
3 minutes
```

Provide:

```text
Find Nearest Stop
```

Allow mock location selection for demo purposes.

---

# 23. TRIP PLANNER

Student enters:

```text
From
To
```

Show:

```text
Available Shuttles

S01
ETA: 4 min
Crowd: MEDIUM
Arrival: 9:20 AM

S03
ETA: 7 min
Crowd: LOW
Arrival: 9:22 AM
```

Highlight the recommended option.

---

# 24. SMART NOTIFICATIONS

Notification types:

```text
ARRIVAL
DELAY
ROUTE_CHANGE
CROWD_WARNING
BREAKDOWN
EMERGENCY
SERVICE_ALERT
```

Examples:

```text
Shuttle S01 arrives at CSE Block in 3 minutes.

Shuttle S02 is delayed by 8 minutes.

High crowd predicted on Academic Route at 9:00 AM.
```

Create notification center.

Allow:

* Mark as read
* Mark all as read

---

# 25. SERVICE ALERTS

Admins can create alerts.

Fields:

```text
title
description
route
severity
startTime
endTime
active
```

Severity:

```text
INFO
WARNING
CRITICAL
```

Example:

```text
WARNING

Academic Route delayed due to campus maintenance.
```

Display active alerts prominently.

Send new alerts through Socket.IO.

---

# 26. BREAKDOWN DETECTION

Monitor shuttle movement.

If a shuttle remains stationary longer than a configurable threshold:

```text
Possible Shuttle Breakdown
```

Create a breakdown report.

Admin sees:

```text
Shuttle: S02
Location: Library
Status: BREAKDOWN
Detected: 2 minutes ago
```

Admin can:

* Resolve
* Disable shuttle
* Notify students

---

# 27. EMERGENCY REPORTING

Students can submit:

```text
Medical Emergency
Accident
Unsafe Situation
Vehicle Problem
Other
```

Fields:

```text
type
description
shuttle
location
createdBy
priority
status
```

Statuses:

```text
OPEN
IN_PROGRESS
RESOLVED
```

Emergency reports must appear in the admin dashboard.

Use critical visual indicators.

This is a simulated campus reporting feature and must not be presented as a replacement for emergency services.

---

# 28. QR BOARDING PASS

Students can generate a digital boarding pass.

Include:

```text
Student Name
Student ID
Route
Date
Pass ID
```

Generate a QR code.

Driver gets a scanner.

Verification checks:

* Pass exists
* Pass is valid
* Date is valid
* Student exists
* Route is valid

Result:

```text
VALID RIDEPULSE PASS
```

or

```text
INVALID / EXPIRED PASS
```

---

# 29. RIDE HISTORY

Record:

```text
Student
Shuttle
Route
Boarding Stop
Destination
Date
Time
```

Student page:

```text
MY RIDES

Today
S01
Hostel → Library
8:42 AM

Yesterday
S03
Hostel → CSE
9:05 AM
```

---

# 30. CARBON SAVINGS

Track shuttle usage and estimate transportation-related carbon savings.

Display:

```text
YOUR IMPACT

Rides This Month
18

Estimated CO₂ Saved
5.4 kg
```

Also show:

* Weekly savings
* Monthly savings
* Total rides
* Total estimated savings

Use clearly documented mock assumptions.

Do not present the estimate as scientifically precise.

---

# 31. STUDENT DASHBOARD

Create a polished student dashboard.

Header:

```text
RidePulse
Search
Notifications
Profile
```

Greeting:

```text
Good Morning, [Name]
```

Stats:

```text
Nearest Shuttle
Next Arrival
Current Crowd
Favorite Route
```

Main section:

### Live Map

Large interactive map.

### Recommended Shuttle

Show best option.

### Nearby Stops

Show nearest stops.

### Active Alerts

Show current alerts.

### Quick Actions

```text
Track Shuttle
Plan Trip
Find Stop
QR Pass
Report Issue
```

---

# 32. DRIVER DASHBOARD

Driver dashboard should show:

```text
Assigned Shuttle
Assigned Route
Current Stop
Next Stop
Passenger Count
Crowd Level
Status
```

Actions:

```text
Start Trip
End Trip
Update Passenger Count
Report Delay
Report Breakdown
Emergency
Scan QR
```

---

# 33. ADMIN DASHBOARD

Sidebar:

```text
Dashboard
Live Map
Shuttles
Routes
Stops
Drivers
Students
Alerts
Emergencies
Breakdowns
Analytics
Predictions
Settings
```

Dashboard cards:

```text
Active Shuttles
Total Students
Today's Rides
Delayed Shuttles
High Crowd Routes
Open Alerts
```

---

# 34. ADMIN SHUTTLE MANAGEMENT

Admin CRUD:

```text
Create Shuttle
View Shuttle
Edit Shuttle
Delete Shuttle
Assign Driver
Assign Route
Set Capacity
Set Status
```

---

# 35. ADMIN ROUTE MANAGEMENT

Admin can:

* Create route
* Edit route
* Delete route
* Add stops
* Reorder stops
* Activate/deactivate route

---

# 36. ADMIN STOP MANAGEMENT

Admin can:

* Create stop
* Edit stop
* Delete stop
* Assign stop to route
* Set coordinates
* Add facilities
* Activate/deactivate stop

---

# 37. ADMIN DRIVER MANAGEMENT

Admin can:

* Add driver
* Edit driver
* Assign shuttle
* Activate/deactivate driver
* View driver activity

---

# 38. USER MANAGEMENT

Admin can:

* View users
* Search users
* Filter by role
* Activate/deactivate users

Do not allow admin to view plaintext passwords.

---

# 39. ANALYTICS

Use Recharts.

Create:

### Daily Rides

Line chart.

### Route Usage

Bar chart.

### Crowd by Hour

Bar chart.

### Shuttle Occupancy

Line/area chart.

### Average Waiting Time

Chart.

### Delays

Chart.

### Carbon Savings

Chart.

Filters:

```text
Today
7 Days
30 Days
```

and:

```text
Route
Shuttle
```

All metrics should come from backend/database data.

Do not hardcode dashboard numbers.

---

# 40. AI ADMIN INSIGHTS

Generate insights from available data.

Examples:

```text
Academic Route experiences peak demand between 8:30 AM and 9:15 AM.

Shuttle S02 frequently reaches high occupancy during morning hours.

Average waiting time increased by 12% this week.

Additional shuttle capacity may be useful during morning peak hours.
```

Insights should be generated from actual available analytics/prediction data.

---

# 41. SEARCH

Global search should support:

* Shuttles
* Routes
* Stops
* Alerts

Example:

```text
Search: Library
```

Results:

```text
Library Stop
Library Route
S01
S03
```

---

# 42. QR AND RIDE FLOW

A complete ride flow should be:

```text
Student
   ↓
Select Destination
   ↓
Trip Planner
   ↓
Recommended Shuttle
   ↓
Generate QR Pass
   ↓
Board Shuttle
   ↓
Driver Scans QR
   ↓
Ride Recorded
   ↓
Ride History Updated
   ↓
Carbon Savings Updated
```

---

# 43. DEMO MODE

Create a dedicated simulation/demo mode.

Admin controls:

```text
START SIMULATION
PAUSE SIMULATION
RESET SIMULATION

SIMULATE DELAY
SIMULATE BREAKDOWN
SIMULATE HIGH CROWD
```

When simulation starts:

* Multiple shuttles move
* ETA updates
* Crowd changes
* Map markers move
* Alerts can appear
* Notifications can appear
* Breakdown detection can trigger

This feature is critical for the hackathon demonstration.

---

# 44. LANDING PAGE

Create a professional landing page.

Hero:

```text
Your Campus.
Your Shuttle.
In Real Time.
```

Subtitle:

```text
Track campus shuttles, predict crowd levels,
plan smarter trips, and travel with confidence.
```

Buttons:

```text
Track Shuttle
Get Started
```

Show an attractive mock/live campus map.

Feature cards:

```text
Live Tracking
Smart ETA
AI Crowd Prediction
Smart Recommendations
Real-Time Alerts
Campus Analytics
```

Add:

* How It Works
* Features
* Benefits
* CTA
* Footer

---

# 45. UI DESIGN

The application must have a polished modern SaaS-style interface.

Use Tailwind CSS.

Design principles:

* Clean
* Professional
* Modern
* Minimal
* Spacious
* Consistent
* Responsive

Use:

* Cards
* Rounded corners
* Subtle shadows
* Status badges
* Tooltips
* Modals
* Toasts
* Skeleton loaders
* Empty states
* Error states

Avoid excessive gradients and visual clutter.

---

# 46. COLOR SYSTEM

Use a transportation/technology theme.

Primary:

```text
Deep Blue / Indigo
```

Secondary:

```text
Cyan / Sky Blue
```

Status:

```text
LOW       → Green
MEDIUM    → Amber
HIGH      → Red

ON_TIME   → Green
DELAYED   → Amber
BREAKDOWN → Red
```

Use colors consistently.

---

# 47. DARK MODE

Implement light and dark modes.

Persist theme preference.

Every page and component must support both themes.

---

# 48. RESPONSIVE DESIGN

Support:

* Desktop
* Laptop
* Tablet
* Mobile

Mobile requirements:

* Responsive sidebar/navigation
* Responsive map
* Stacked dashboard cards
* Touch-friendly controls
* Readable ETA/crowd information
* Responsive tables

---

# 49. REUSABLE COMPONENTS

Create reusable components such as:

```text
Navbar
Sidebar
MobileNav
ShuttleCard
ShuttleMap
ShuttleMarker
RouteCard
StopCard
ETAIndicator
CrowdBadge
OccupancyBar
AlertCard
NotificationPanel
RecommendationCard
StatCard
AnalyticsChart
QRPass
Modal
Toast
LoadingSkeleton
EmptyState
ErrorState
```

Avoid duplicating UI logic.

---

# 50. FRONTEND ROUTES

Public:

```text
/
 /login
 /register
```

Student:

```text
/student/dashboard
/student/map
/student/routes
/student/trip-planner
/student/notifications
/student/rides
/student/qr-pass
/student/profile
```

Driver:

```text
/driver/dashboard
/driver/shuttle
/driver/trip
/driver/scan-pass
/driver/report
```

Admin:

```text
/admin/dashboard
/admin/live-map
/admin/shuttles
/admin/routes
/admin/stops
/admin/drivers
/admin/users
/admin/alerts
/admin/emergencies
/admin/breakdowns
/admin/analytics
/admin/predictions
/admin/settings
```

---

# 51. REST API

Implement:

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
```

## Shuttles

```text
GET    /api/shuttles
GET    /api/shuttles/:id
POST   /api/shuttles
PUT    /api/shuttles/:id
DELETE /api/shuttles/:id
```

## Routes

```text
GET    /api/routes
GET    /api/routes/:id
POST   /api/routes
PUT    /api/routes/:id
DELETE /api/routes/:id
```

## Stops

```text
GET    /api/stops
GET    /api/stops/:id
POST   /api/stops
PUT    /api/stops/:id
DELETE /api/stops/:id
```

## Alerts

```text
GET    /api/alerts
POST   /api/alerts
PUT    /api/alerts/:id
DELETE /api/alerts/:id
```

## Predictions

```text
GET /api/predictions/crowd/:routeId
```

## Analytics

```text
GET /api/analytics/dashboard
GET /api/analytics/rides
GET /api/analytics/crowd
GET /api/analytics/routes
```

## Rides

```text
GET  /api/rides/my
POST /api/rides
```

## Notifications

```text
GET /api/notifications
PUT /api/notifications/:id/read
PUT /api/notifications/read-all
```

## Emergency

```text
POST /api/emergency
GET  /api/emergency
PUT  /api/emergency/:id
```

## QR

```text
POST /api/qr/generate
POST /api/qr/verify
```

Use correct HTTP status codes.

Use consistent JSON response structures.

---

# 52. API RESPONSE FORMAT

Use a consistent structure.

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error message"
}
```

Never expose stack traces or sensitive internal information to users.

---

# 53. SOCKET EVENTS

Implement:

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

Document each event in README.

---

# 54. SECURITY

Implement:

* Password hashing
* JWT authentication
* Protected routes
* Role-based authorization
* Input validation
* Sanitization
* CORS
* Environment variables
* Secure error handling

Never hardcode secrets.

Use:

```text
.env
```

Create:

```text
.env.example
```

---

# 55. ENVIRONMENT VARIABLES

Example:

```text
PORT=
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
```

Add only required environment variables.

Never commit `.env`.

---

# 56. SAMPLE DATA

Create seed data containing:

* 5 routes
* 15+ stops
* 5–8 shuttles
* Drivers
* Students
* Historical ride records
* Crowd history
* Alerts
* Notifications
* Prediction data

Use mock campus coordinates.

The project must work immediately after seeding.

---

# 57. ERROR HANDLING

Implement:

* API error handling
* Network error handling
* Form validation
* Authentication errors
* Authorization errors
* Empty states
* Loading states
* 404 page
* Unauthorized page

Every API request should handle:

```text
loading
success
error
```

---

# 58. PERFORMANCE

Optimize:

* React rendering
* Map updates
* Socket connections
* API requests
* Database queries

Do not recreate unnecessary Socket.IO connections.

Do not update the entire application state for every map coordinate change if unnecessary.

Use efficient state management.

---

# 59. ACCESSIBILITY

Use:

* Semantic HTML
* Proper labels
* Keyboard accessibility
* Accessible buttons
* Sufficient contrast
* ARIA labels where appropriate

Maps and charts should have understandable accompanying information.

---

# 60. DEVELOPMENT PRINCIPLES

Follow these rules throughout development:

1. Do not build a static prototype.
2. Do not create fake buttons.
3. Do not hardcode dynamic dashboard data.
4. Do not hardcode shuttle recommendations.
5. Do not teleport simulated shuttles.
6. Use real API communication.
7. Use MongoDB for persistent data.
8. Use Socket.IO for real-time updates.
9. Use Tailwind CSS for styling.
10. Keep frontend/backend responsibilities separate.
11. Keep prediction logic modular.
12. Keep recommendation logic modular.
13. Use reusable components.
14. Validate user input.
15. Protect admin APIs.
16. Keep secrets in environment variables.
17. Add meaningful error handling.
18. Add loading and empty states.
19. Keep the application responsive.
20. Do not introduce unnecessary dependencies.
21. Prefer simple reliable implementations over unnecessary complexity.
22. Every feature must be testable.
23. Do not mark a feature complete until it actually works.
24. If an external API is unavailable, use a local simulation rather than making the entire application dependent on it.
25. Clearly label simulated data/features.

---

# 61. DEMO CREDENTIALS

Create seed/demo users.

Example:

```text
Student:
student@ridepulse.demo

Driver:
driver@ridepulse.demo

Admin:
admin@ridepulse.demo
```

Passwords must be generated securely during seeding and documented appropriately.

Do not hardcode plaintext passwords inside frontend code.

---

# 62. HACKATHON DEMONSTRATION FLOW

The final demo should follow this sequence:

### Step 1

Open RidePulse landing page.

### Step 2

Login as student.

### Step 3

Student dashboard displays:

* Live map
* Active shuttles
* ETA
* Crowd

### Step 4

Start shuttle simulation from admin/demo mode.

### Step 5

Show shuttle marker moving on map.

### Step 6

Show ETA changing dynamically.

### Step 7

Show crowd changing.

### Step 8

Open AI prediction.

Show predicted crowd for upcoming time periods.

### Step 9

Enter:

```text
Hostel → Library
```

Show intelligent shuttle recommendation.

### Step 10

Generate QR boarding pass.

### Step 11

Switch to driver account.

Scan QR.

### Step 12

Show ride recorded in student ride history.

### Step 13

Simulate a delay.

Show real-time notification.

### Step 14

Simulate high crowd.

Show crowd warning.

### Step 15

Simulate breakdown.

Show admin breakdown notification.

### Step 16

Open analytics.

Show:

* Daily rides
* Route usage
* Crowd patterns
* Occupancy
* Delays
* Carbon savings

This should demonstrate the majority of RidePulse's functionality in a short presentation.

---

# 63. DEVELOPMENT PHASES

Build the project in this order.

## Phase 1

Project setup and architecture.

## Phase 2

Authentication and roles.

## Phase 3

Database models and CRUD.

## Phase 4

Maps and shuttle simulation.

## Phase 5

ETA, crowd monitoring and trip planner.

## Phase 6

AI crowd prediction and recommendations.

## Phase 7

Notifications, alerts, breakdowns and emergencies.

## Phase 8

QR passes, ride history and carbon savings.

## Phase 9

Admin dashboard and analytics.

## Phase 10

Final UI polish, responsive design, testing and documentation.

Do not implement all phases simultaneously.

---

# 64. AGENT WORKFLOW

The coding agent must follow this workflow:

```text
READ SPEC
    ↓
UNDERSTAND REQUIREMENTS
    ↓
PLAN CURRENT PHASE
    ↓
IMPLEMENT
    ↓
RUN APPLICATION
    ↓
TEST
    ↓
FIX ERRORS
    ↓
VERIFY
    ↓
REPORT COMPLETION
```

Do not move to the next phase automatically.

After each phase, report:

```text
Implemented:
- ...

Tested:
- ...

Issues found:
- ...

Issues fixed:
- ...

Remaining:
- ...
```

Wait for the developer to explicitly request the next phase.

---

# 65. SOURCE OF TRUTH

This file is the primary specification for RidePulse.

When making implementation decisions:

1. Follow this specification.
2. Preserve existing working functionality.
3. Do not remove completed features without a clear reason.
4. Do not introduce major architectural changes without explaining why.
5. If requirements conflict, identify the conflict before changing the architecture.
6. Prefer maintainability and reliability.
7. Keep the application hackathon-demo friendly.

---

# 66. DEFINITION OF DONE

RidePulse is considered complete only when:

* Frontend builds successfully.
* Backend starts successfully.
* MongoDB connects successfully.
* Authentication works.
* Role-based access works.
* Student dashboard works.
* Driver dashboard works.
* Admin dashboard works.
* Map works.
* Shuttle simulation works.
* Multiple shuttles move.
* ETA updates dynamically.
* Crowd levels update.
* Crowd prediction works.
* Shuttle recommendation works.
* Nearest stop works.
* Trip planner works.
* Notifications work.
* Alerts work.
* Breakdown detection works.
* Emergency reporting works.
* QR pass generation works.
* QR verification works.
* Ride history works.
* Carbon tracking works.
* Analytics work.
* Admin CRUD operations work.
* Socket.IO real-time updates work.
* Responsive UI works.
* Dark mode works.
* Error states work.
* Loading states work.
* README is complete.
* Seed data works.
* No major feature is left as a TODO.
* No critical console/runtime errors remain.

---

# 67. FINAL PRODUCT

The final product must feel like a real smart campus transportation platform.

The student experience should be:

```text
OPEN RIDE PULSE
      ↓
SEE LIVE SHUTTLES
      ↓
CHECK ETA
      ↓
CHECK CROWD
      ↓
VIEW CROWD PREDICTION
      ↓
GET BEST SHUTTLE RECOMMENDATION
      ↓
GENERATE QR PASS
      ↓
TAKE SHUTTLE
      ↓
RIDE RECORDED
      ↓
VIEW CARBON SAVINGS
```

The administrator experience should be:

```text
OPEN ADMIN DASHBOARD
      ↓
MONITOR LIVE SHUTTLES
      ↓
CHECK CROWD
      ↓
VIEW PREDICTIONS
      ↓
MANAGE FLEET
      ↓
MANAGE ROUTES/STOPS
      ↓
HANDLE ALERTS
      ↓
HANDLE EMERGENCIES
      ↓
HANDLE BREAKDOWNS
      ↓
VIEW ANALYTICS
      ↓
MAKE TRANSPORTATION DECISIONS
```

RidePulse should demonstrate how real-time tracking, data analytics, prediction, and intelligent recommendations can improve campus transportation.
