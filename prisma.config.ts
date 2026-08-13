import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // El CLI (migrate/studio) usa la conexión directa — sin pooler —
    // porque las migraciones necesitan un lock de sesión estable.
    url: env("DIRECT_URL"),
  },
});
