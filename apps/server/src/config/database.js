import mongoose from "mongoose"

const READY_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
}

// Connect to MongoDB
export async function connectDB(uri) {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected")
  })

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected")
  })

  mongoose.connection.on("error", (err) => {
    console.error(`MongoDB connection error: ${err.message}`)
  })

  await mongoose.connect(uri)
}

export function getMongoStatus() {
  return READY_STATES[mongoose.connection.readyState] || "unknown"
}