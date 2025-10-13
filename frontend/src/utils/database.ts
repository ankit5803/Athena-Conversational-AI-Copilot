import mongoose from "mongoose";

let isConnected = false;
let dbUrl = process.env.MONGODB_URI || "";
export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(dbUrl, {
      dbName: "athena",
    });
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
