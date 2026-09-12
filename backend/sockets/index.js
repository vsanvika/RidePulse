const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function initSockets(httpServer, { clientUrl, allowAllOrigins }) {
  const io = new Server(httpServer, {
    cors: {
      origin: allowAllOrigins ? true : clientUrl,
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "ridepulse_secret_key_2026"
      );
      const user = await User.findById(decoded.id).select("_id role isActive");
      if (!user || !user.isActive) return next(new Error("Invalid user"));

      socket.user = user;
      next();
    } catch (_error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    socket.join("fleet");
    socket.join(`user:${userId}`);
    if (socket.user.role === "ADMIN") socket.join("admin");

    console.log(`Socket connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

module.exports = { initSockets };
