import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `env()` de prisma/config lanza si la variable falta, incluso para
    // `prisma generate` (que no necesita conexión real) — eso rompía el
    // build en Vercel antes de configurar Neon. Leemos process.env
    // directamente para que generate funcione sin DB; migrate/studio sí
    // fallarán con un error claro si DIRECT_URL falta cuando de verdad
    // necesitan conectarse.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
