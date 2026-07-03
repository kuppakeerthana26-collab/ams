import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const rawEnv = {
  ...process.env,
  MONGO_URI: process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI,
  TEACHER_REGISTRATION_CODE: process.env.TEACHER_REGISTRATION_CODE || process.env.SECRET_CODE,
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  ADMIN_REGISTRATION_CODE: z.string().default("change-me-admin-code"),
  TEACHER_REGISTRATION_CODE: z.string().default("change-me-teacher-code"),
  SEED_ADMIN_NAME: z.string().default("System Administrator"),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
  SEED_HOD_NAME: z.string().default("Department HOD"),
  SEED_HOD_EMAIL: z.string().email().optional(),
  SEED_HOD_PASSWORD: z.string().min(8).optional(),
  SEED_HOD_DEPARTMENT: z.string().optional().default(""),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().optional().default(""),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional().default(""),
  GOOGLE_PRIVATE_KEY: z.string().optional().default(""),
  META_WHATSAPP_TOKEN: z.string().optional().default(""),
  META_PHONE_NUMBER_ID: z.string().optional().default(""),
  META_WHATSAPP_API_VERSION: z.string().default("v20.0"),
  NOTIFICATION_RETRY_LIMIT: z.coerce.number().default(3),
  NOTIFICATION_RETRY_INTERVAL_MS: z.coerce.number().default(10 * 60 * 1000),
});

export const env = envSchema.parse(rawEnv);
