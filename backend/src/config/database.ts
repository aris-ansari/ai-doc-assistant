import mongoose from "mongoose";
import { env } from "./env";

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Exits the process with failure if the connection cannot be established.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      "❌ Error connecting to MongoDB:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
