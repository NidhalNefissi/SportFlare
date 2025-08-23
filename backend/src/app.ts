// Small optional module to export the configured app (useful for tests)
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { json } from "body-parser";

import apiRouter from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(json());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
);

app.use("/api", apiRouter);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

export default app;
