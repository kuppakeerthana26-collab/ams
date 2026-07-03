import mongoose from "mongoose";
import { env } from "./env.js";

const connectDb = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  console.log("MongoDB connected");
};

export default connectDb;
