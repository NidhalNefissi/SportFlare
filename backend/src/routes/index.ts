import express from "express";
import healthRouter from "./health";

const router = express.Router();

router.use("/health", healthRouter);

// TODO: mount auth, users, classes, payments, websockets, file uploads, etc.
// e.g. router.use("/auth", authRouter);

export default router;
