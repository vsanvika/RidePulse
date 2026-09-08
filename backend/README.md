# RidePulse Backend

This is the Node.js and Express API for the RidePulse campus transportation and safety platform. It powers authentication, shuttle data, route management, alerts, emergencies, QR passes, ride tracking, socket events, and the simulation engine that drives real-time campus updates.

## Overview

The backend is responsible for:

- User authentication and role-based access
- MongoDB data management for shuttles, routes, stops, drivers, alerts, emergencies, rides, and notifications
- Real-time updates using Socket.IO
- Shuttle simulation for live movement across campus
- AI and prediction services for crowd and route analytics
- Admin operations for monitoring, emergency response, and system alerts

## Tech Stack

- Node.js 18+
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT for authentication
- bcryptjs for password hashing
- dotenv for environment configuration
- CORS support

## Project Structure

```text
backend/
├── config/
│   ├── db.js
│   └── env.js
├── controllers/
│   ├── adminController.js
│   ├── alertController.js
│   ├── authController.js
│   ├── driverController.js
│   ├── emergencyController.js
│   ├── healthController.js
│   ├── intelligenceController.js
│   ├── notificationController.js
│   ├── passController.js
│   ├── predictionController.js
│   ├── rideController.js
│   ├── routeController.js
│   ├── shuttleController.js
│   ├── simulationController.js
│   ├── stopController.js
│   └── sustainabilityController.js
├── middleware/
│   ├── auth.js
│   ├── authorize.js
│   ├── errorHandler.js
│   └── notFound.js
├── models/
│   ├── Alert.js
│   ├── BreakdownReport.js
│   ├── Driver.js
│   ├── EmergencyReport.js
│   ├── Notification.js
│   ├── Prediction.js
│   ├── QRPass.js
│   ├── Ride.js
│   ├── Route.js
│   ├── Shuttle.js
│   ├── Stop.js
│   ├── Trip.js
│   └── User.js
├── routes/
│   ├── adminRoutes.js
│   ├── alertRoutes.js
│   ├── authRoutes.js
│   ├── driverRoutes.js
│   ├── emergencyRoutes.js
│   ├── healthRoutes.js
│   ├── intelligenceRoutes.js
│   ├── notificationRoutes.js
│   ├── passRoutes.js
│   ├── predictionRoutes.js
│   ├── rideRoutes.js
│   ├── routeRoutes.js
│   ├── shuttleRoutes.js
│   ├── simulationRoutes.js
│   ├── stopRoutes.js
│   └── sustainabilityRoutes.js
├── seed/
│   ├── campus.js
│   └── demoUsers.js
├── services/
│   └── predictionService.js
├── simulation/
│   └── shuttleSimulator.js
├── sockets/
│   └── index.js
├── utils/
│   ├── apiResponse.js
│   ├── generateToken.js
│   ├── intelligenceEngine.js
│   └── recommendationEngine.js
├── validators/
│   └── authValidators.js
├── config.env.example
├── package.json
├── server.js
└── README.md
```

## Environment Setup

Create a `.env` file in the project root or inside the backend folder. The application loads environment values from both locations.

Example:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ridepulse
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Required configuration

- `PORT`: backend server port
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: secret used to sign authentication tokens
- `CLIENT_URL`: frontend URL allowed by CORS

## Installation

From the backend directory:

```bash
npm install
```

## Running the server

### Development mode

```bash
npm run dev
```

This starts the server with Nodemon for auto-reload.

### Production mode

```bash
npm start
```

## Server startup behavior

When the server starts, it:

1. Loads environment variables
2. Connects to MongoDB
3. Seeds demo users and campus data if needed
4. Creates the HTTP server
5. Initializes Socket.IO listeners
6. Starts the shuttle simulation engine
7. Begins listening on the configured port

## API Structure

The backend exposes all APIs under `/api`.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (if implemented in the app flow)

### Shuttle and campus data

- `GET /api/shuttles`
- `GET /api/routes`
- `GET /api/stops`
- `POST /api/routes`
- `PUT /api/routes/:id`
- `DELETE /api/routes/:id`

### Intelligence and predictions

- `GET /api/intelligence/recommendations`
- `GET /api/predictions/crowd/:routeId`
- `GET /api/admin/metrics`

### Safety and alerts

- `POST /api/alerts`
- `GET /api/alerts`
- `POST /api/emergencies`
- `GET /api/emergencies`
- `POST /api/notifications`

### Pass and ride APIs

- `POST /api/passes/generate`
- `POST /api/passes/verify`
- `GET /api/rides`
- `POST /api/rides`

### Sustainability

- `GET /api/sustainability/stats`

### Health

- `GET /api/health`

## Socket.IO Events

The backend sets up a socket connection for real-time campus updates.

Common events include:

- `shuttle:location`
- `shuttle:update`
- `alert:new`
- `emergency:new`
- `notification:new`
- `simulation:status`

These are used by the frontend to update the map, dashboard metrics, alerts, and emergency banners in real time.

## Simulation Engine

The backend includes a shuttle simulator that updates shuttle positions and status based on route geometry and campus movement rules. This is started automatically when the service boots.

The simulation is important because it powers:

- live shuttle movement on the map
- crowd density changes
- route status updates
- breakdown and alert scenarios
- real-time dashboards

## Database and seeds

The backend includes seed scripts to populate:

- demo users
- campus stops
- shuttle routes
- route assignments
- sample admin/driver/student accounts

These are useful during local development and demos.

## Middleware and security

The app uses several middleware layers:

- `auth.js`: validates JWT tokens
- `authorize.js`: restricts access by user role
- `errorHandler.js`: centralized error responses
- `notFound.js`: handles missing routes

## Typical development flow

1. Start MongoDB locally
2. Create the `.env` file
3. Run `npm install`
4. Start the backend with `npm run dev`
5. Confirm the API is reachable on `http://localhost:5000`
6. Start the frontend and test the end-to-end flows

## Troubleshooting

### MongoDB connection errors

- Make sure MongoDB is running
- Verify the `MONGO_URI` value
- Confirm the database is accessible and the user has permissions

### JWT issues

- Ensure `JWT_SECRET` is set in the environment
- Check that the frontend sends the token in the `Authorization` header

### CORS issues

- Confirm `CLIENT_URL` matches the frontend origin
- Ensure the frontend is running on `http://localhost:5173` or the configured value

## Notes

This backend is designed to support a campus transportation platform with live route monitoring, driver operations, emergency handling, analytics, and simulation-driven UI updates. It is the API and real-time data layer for the full RidePulse system.
