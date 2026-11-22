import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app", "localhost"],
  // Prisma y better-sqlite3 cargan WASM y bindings nativos desde node_modules
  // en runtime; no deben empaquetarse en el bundle del servidor.
  serverExternalPackages: ["@prisma/client", "prisma", "@prisma/adapter-better-sqlite3", "better-sqlite3"],
  // Incluye la base SQLite de demo y el engine de Prisma en el bundle del servidor
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db", "./node_modules/.prisma/client/*engine*", "./node_modules/.prisma/client/*.wasm"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
