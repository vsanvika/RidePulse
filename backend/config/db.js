const mongoose = require("mongoose");

async function connectDb(mongoUri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("MongoDB connected");
}

function getMongoStatus() {
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
}

module.exports = { connectDb, getMongoStatus };
