import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { prisma } from "./lib/prisma.js";
import startupsRouter from "./routes/startups.js";
import { PORT, APP_HOSTNAME } from "./config/env.js";
import apiRouter from "./routes/apiRouter.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import analysisRouter from "./routes/analysis.js";
import mentorsRouter from "./routes/mentors.js";

const app = express();

// --- Core middleware FIRST (before any routes) ---
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// --- Graceful DB connection test ---
async function testDB() {
  if (!prisma) {
    console.warn("⚠️  Skipping DB connection test — Prisma is not initialized (no DATABASE_URL).");
    return;
  }
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL Connected");
  } catch (error) {
    console.error("⚠️  PostgreSQL connection failed:", error.message);
    console.warn("⚠️  Server will continue without database. DB-dependent routes may return errors.");
  }
}

async function startServer() {
  // Test DB connection (non-blocking)
  await testDB();

  // Security headers for production
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": [
            "'self'", "'unsafe-inline'", "'unsafe-eval'",
            "https://unpkg.com", "https://cdn.jsdelivr.net",
            "https://apis.google.com", "https://*.firebaseapp.com",
            "https://www.googletagmanager.com", "https://maps.googleapis.com"
          ],
          "img-src": [
            "'self'", "data:", "https:", "http:",
            "https://*.tile.openstreetmap.org", "https://*.google.com",
            "https://*.googleusercontent.com", "https://www.google-analytics.com",
            "https://api.dicebear.com"
          ],
          "connect-src": [
            "'self'", "https:", "http:", "ws:", "wss:",
            "https://*.googleapis.com", "https://*.firebaseapp.com",
            "https://*.firebase.com",
            "https://www.google-analytics.com", "https://analytics.google.com",
            "https://firebaseinstallations.googleapis.com"
          ],
          "frame-src": ["'self'", "https://*.firebaseapp.com", "https://apis.google.com"],
          "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
          "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
        },
      },
    })
  );

  // Rate limiting to prevent API abuse
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiter to API routes only
  app.use("/api/", limiter);

  // Debug route
  app.get("/api/debug-env", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // --- API Routes (all registered AFTER middleware) ---
  app.use("/api/mentors", mentorsRouter);
  app.use("/api", apiRouter);
  app.use("/api/analysis", analysisRouter);
  app.use("/api/startups", startupsRouter);

  // --- Vite middleware for development / Static files for production ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback — only for non-API routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler (must be last middleware)
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://${APP_HOSTNAME}:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server Startup Failed:", error);
  process.exit(1);
});