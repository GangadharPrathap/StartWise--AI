import express from "express";
import cors from "cors";
import { prisma } from "../server/lib/prisma.js";
import apiRouter from "../server/routes/apiRouter.js";
import analysisRouter from "../server/routes/analysis.js";
import startupsRouter from "../server/routes/startups.js";
import mentorsRouter from "../server/routes/mentors.js";
import { errorHandler } from "../server/middleware/errorHandler.js";
import { requestLogger } from "../server/middleware/logger.js";

const app = express();

// Core middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-firebase-uid']
}));
app.use(express.json());
app.use(requestLogger);

// Test DB connection on cold start (non-blocking)
if (prisma) {
  prisma.$connect().catch(err => {
    console.warn("⚠️ PostgreSQL connection failed:", err.message);
  });
}

// Debug route
app.get("/api/debug-env", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), env: "vercel-serverless" });
});

// API Routes
app.use("/api/mentors", mentorsRouter);
app.use("/api", apiRouter);
app.use("/api/analysis", analysisRouter);
app.use("/api/startups", startupsRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
