import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().regex(/^\d+$/).optional(),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_MAX: z.string().optional()
});

export function validateEnv() {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    console.error("Environment validation failed:", result.error.format());
    throw new Error("Invalid environment variables. See logs.");
  }
  return result.data;
}
