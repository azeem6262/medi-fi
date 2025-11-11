import "./config/env";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import recordsRouter from "./routes/records";
import accessGrantsRouter from "./routes/access-grants";
import providersRouter from "./routes/providers";
import uploadRouter from "./routes/upload";
import { connectDatabase } from "./config/database";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "MediFi API is running" });
});

// API Routes
app.use("/api/records", recordsRouter);
app.use("/api/access-grants", accessGrantsRouter);
app.use("/api/providers", providersRouter);
app.use("/api/upload", uploadRouter);

console.log("✅ Upload router loaded:", typeof uploadRouter);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server and connect to database
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 MediFi API server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
