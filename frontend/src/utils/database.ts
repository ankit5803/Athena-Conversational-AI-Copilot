import mongoose from "mongoose";
export async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI || "";
    if (!uri) {
      throw new Error("MongoDB connection string is missing!");
    }

    // Prevent multiple connections in dev/hot-reload
    if (mongoose.connection.readyState === 1) {
      console.log("✅ Already connected to MongoDB");
      return mongoose.connection;
    }

    const conn = await mongoose.connect(uri, {
      dbName: "athena",
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
