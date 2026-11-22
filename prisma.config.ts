import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Prisma CLI en modo "js": motor de esquema implementado en JavaScript/WASM.
 * No descarga binarios nativos (binaries.prisma.sh), que no son accesibles
 * desde todos los entornos de build. El mismo adapter se usa en runtime.
 *
 * NOTA: la ruta de la base SQLite apunta a prisma/dev.db (datos de ejemplo).
 */
const databaseUrl =
  process.env.DATABASE_URL?.replace(/^file:(?!\/)/, `file:${path.join(process.cwd(), "prisma")}/`) ??
  `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  experimental: {
    adapter: true,
  },
  engine: "js",
  adapter: async () => new PrismaBetterSQLite3({ url: databaseUrl }),
});
