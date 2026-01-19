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

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// DB
connectDB();

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/files", fileRoutes);

// Health Route ✅ (ADD THIS)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend running successfully 🚀"
  });
});

// Root Route
app.get("/", (req, res) => {
  res.send("hello");
});

// IMPORTANT: Listen on Render Port ✅
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
