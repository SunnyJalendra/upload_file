import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import fileRoutes from "./routes/files.routes.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL, // e.g. http://localhost:5173
    credentials: true,
  }));

// DB
connectDB();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());



// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/files", fileRoutes);

app.get("/", (req, res) => {
  res.send("hello");
});

export default app;
