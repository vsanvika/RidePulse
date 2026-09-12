const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { loadEnv } = require("./config/env");
const { connectDb } = require("./config/db");
const { initSockets } = require("./sockets");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const stopRoutes = require("./routes/stopRoutes");
const routeRoutes = require("./routes/routeRoutes");
const shuttleRoutes = require("./routes/shuttleRoutes");
const driverRoutes = require("./routes/driverRoutes");
const alertRoutes = require("./routes/alertRoutes");
const simulationRoutes = require("./routes/simulationRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const passRoutes = require("./routes/passRoutes");
const rideRoutes = require("./routes/rideRoutes");
const sustainabilityRoutes = require("./routes/sustainabilityRoutes");
const adminRoutes = require("./routes/adminRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const { seedDemoUsers } = require("./seed/demoUsers");
const { seedCampusData } = require("./seed/campus");
const { startSimulation } = require("./simulation/shuttleSimulator");

const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

async function start() {
  const config = loadEnv();
  const app = express();

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = new Set(config.allowedOrigins);
    const normalizedOrigin = origin?.replace(/\/$/, "");
    const originAllowed =
      config.allowAllOrigins || !origin || allowedOrigins.has(normalizedOrigin);

    if (originAllowed) {
      res.header("Access-Control-Allow-Origin", origin || "*");
      if (!config.allowAllOrigins) {
        res.header("Access-Control-Allow-Credentials", "true");
      }
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });
  app.use(express.json());

  // Mount API Endpoints
  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/stops", stopRoutes);
  app.use("/api/routes", routeRoutes);
  app.use("/api/shuttles", shuttleRoutes);
  app.use("/api/drivers", driverRoutes);
  app.use("/api/alerts", alertRoutes);
  app.use("/api/simulation", simulationRoutes);
  app.use("/api/intelligence", intelligenceRoutes);
  app.use("/api/predictions", predictionRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/emergencies", emergencyRoutes);
  app.use("/api/passes", passRoutes);
  app.use("/api/rides", rideRoutes);
  app.use("/api/sustainability", sustainabilityRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/settings", settingsRoutes);

  if (config.nodeEnv === "production") {
    const frontendDist = path.join(__dirname, "../frontend/dist");
    app.use(express.static(frontendDist));
    app.get(/^(?!\/api).*$/, (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  try {
    await connectDb(config.mongoUri);
    await seedDemoUsers();
    await seedCampusData();
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
  }

  const httpServer = http.createServer(app);
  const io = initSockets(httpServer, config);
  app.set("io", io);

  httpServer.listen(config.port, () => {
    console.log(`RidePulse API listening on port ${config.port}`);
    console.log(`Client origin (CORS): ${config.clientUrl}`);

    // Auto-start simulation engine
    startSimulation(io);
  });
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
