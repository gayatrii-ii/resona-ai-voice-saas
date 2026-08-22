import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    APP_URL: z.string().min(1),
    SUPABASE_URL: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET: z.string().default("resona-audio"),
    CHATTERBOX_API_URL: z.url().optional().default("https://placeholder.modal.run"),
    CHATTERBOX_API_KEY: z.string().optional().default("placeholder"),
  },
  experimental__runtimeEnv: {},
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
