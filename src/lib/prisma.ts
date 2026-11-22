import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma resuelve rutas sqlite relativas respecto al directorio del schema en
 * tiempo de generación, lo cual se rompe en despliegues serverless (Vercel).
 * Convertimos rutas `file:` relativas en absolutas a partir del cwd para que
 * siempre apunten a prisma/dev.db.
 */
function resolveSqliteUrl(raw: string | undefined): string {
  const fallback = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
  if (!raw) return fallback;
  const match = raw.match(/^file:(.+)$/);
  if (!match) return raw;
  const dbPath = match[1];
  if (path.isAbsolute(dbPath)) return raw;
  return `file:${path.join(process.cwd(), "prisma", dbPath)}`;
}

// Cliente Prisma sin motor nativo (WASM query compiler + adapter better-sqlite3).
// Ver prisma/schema.prisma (engineType = "client") y prisma.config.ts.
const adapter = new PrismaBetterSQLite3({ url: resolveSqliteUrl(process.env.DATABASE_URL) });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
