import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app", "localhost"],
  // Incluye la base SQLite de demo y el engine de Prisma en el bundle del servidor
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db", "./node_modules/.prisma/client/*engine*"],
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
