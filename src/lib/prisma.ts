import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma resuelve rutas sqlite relativas contra el directorio del schema en
 * tiempo de generación, lo cual se rompe en despliegues serverless (Vercel).
 * Convertimos rutas `file:` relativas en absolutas a partir del cwd para que
 * siempre apunten a prisma/dev.db.
 */
function resolveSqliteUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  const match = raw.match(/^file:(.+)$/);
  if (!match) return raw;
  const dbPath = match[1];
  if (path.isAbsolute(dbPath)) return raw;
  return `file:${path.join(process.cwd(), "prisma", dbPath)}`;
}

const datasourceUrl = resolveSqliteUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
