import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Standard `pg` (TCP) driver adapter — works against Neon's regular
 * connection string as well as any Postgres, including local dev. We stay
 * off the Neon HTTP/WebSocket driver since the app runs on the Node.js
 * runtime (bcrypt et al.), not the Edge runtime, so there's no need for it.
 */
function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
