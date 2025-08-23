import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { json } from "body-parser";

import { validateEnv } from "./utils/validateEnv";
import { errorHandler } from "./middleware/errorHandler";
import apiRouter from "./routes";

validateEnv();

const app = express();

// Basic middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true
  })
);
app.use(json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX ?? 100)
  })
);

// Routes
app.use("/api", apiRouter);

// Health check
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// Error handler (last)
app.use(errorHandler);

// Start server with graceful shutdown
const port = Number(process.env.PORT ?? 4000);
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Backend listening on port ${port} (${process.env.NODE_ENV})`);
});

const shutdown = (signal: string) => {
  console.info(`Received ${signal}, shutting down...`);
  server.close((err?: Error) => {
    if (err) {
      console.error("Error closing server:", err);
      process.exit(1);
    }
    console.info("Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
