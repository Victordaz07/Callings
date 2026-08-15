#!/usr/bin/env node
// Corre las migraciones de Prisma antes del build, pero solo si hay una
// base de datos configurada — así el build nunca se rompe en un deploy
// donde DATABASE_URL/DIRECT_URL todavía no se hayan agregado (p. ej. antes
// de conectar Neon por primera vez).
//
// Vercel inyecta las variables de entorno configuradas directo en
// process.env durante el build, así que esto es solo para desarrollo
// local (un `npm run build` normal no carga .env por su cuenta, a
// diferencia de `next build`).
import "dotenv/config";
import { spawnSync } from "node:child_process";

const hasDb = Boolean(process.env.DIRECT_URL || process.env.DATABASE_URL);

if (hasDb) {
  const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true,
  });
  if (migrate.status !== 0) process.exit(migrate.status ?? 1);
} else {
  console.warn(
    "⚠️  DATABASE_URL/DIRECT_URL no están configuradas — saltando `prisma migrate deploy`. " +
      "Las rutas que dependen de Postgres (signup, login, secretario, ajustes) fallarán en runtime hasta que las agregues."
  );
}

const build = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
});
process.exit(build.status ?? 1);
