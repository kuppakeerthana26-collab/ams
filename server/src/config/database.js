import mongoose from "mongoose";
import dns from "dns";
import { env } from "./env.js";

// Fix DNS resolution order on Windows / Node 18+ to resolve Atlas SRV shards via IPv4 first
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore if not supported
}

const connectDb = async (retries = 5, delay = 3000) => {
  mongoose.set("strictQuery", true);

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4 to prevent ENOTFOUND on dual-stack networks
      });
      console.log("MongoDB connected successfully");
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("All MongoDB connection retries exhausted. Please verify internet connectivity & Atlas cluster access.");
      }
    }
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Connection will automatically retry when available.");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime connection error:", err.message);
});

export default connectDb;
