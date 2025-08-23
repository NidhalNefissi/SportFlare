import { RequestHandler } from "express";

/**
 * Wrap async route handlers so thrown errors are passed to next()
 */
export const asyncWrapper =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
