import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/minidrive");
    console.log(`MongoDB Connected: ${conn.connection.host} 👍`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message + "👎");
  }
};

export default connectDB;
