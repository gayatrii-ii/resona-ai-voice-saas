import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { env } from "./env";

const connectionString = env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
  ssl:
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com")
      ? { rejectUnauthorized: false }
      : undefined,
  max: 10,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
