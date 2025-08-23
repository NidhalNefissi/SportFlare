import { Request, Response, NextFunction } from "express";

/**
 * Centralized error handler.
 * - In production keep messages generic
 * - In development include stack and details
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  const isDev = process.env.NODE_ENV !== "production";
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || "Internal Server Error";

  const payload: any = { message };
  if (isDev) {
    payload.stack = err?.stack;
    if (err?.details) payload.details = err.details;
  }

  res.status(status).json(payload);
}
