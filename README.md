# Centro de Servicio

PWA para herramientas de llamamientos de La Iglesia de Jesucristo de los
Santos de los Últimos Días. Hub con módulos independientes: **Secretario**,
**Gather** (líder misional) y **BautizApp**, más **Ajustes** compartidos entre
los tres. Herramienta de planificación personal — no oficial, no reemplaza
LCR (ver `COMPLIANCE.md`).

## Stack

- **Next.js 16 (App Router) + TypeScript** — Vercel es su casa natural.
- **Tailwind CSS v4**, tokens de color/tipografía definidos en
  `src/app/globals.css` (`@theme`), tomados 1:1 del sistema de diseño del
  proyecto (paleta deep-water/dawn-coral, Fraunces + Karla).
- **PWA**: `src/app/manifest.ts` + `public/sw.js` (service worker manual,
  sin dependencias de terceros) — precache del shell y fallback offline en
  `/offline`. Solo usa Cache API y fetch, compatible con un futuro WebView de
  Capacitor.
- **Auth**: NextAuth v5 con Credentials (correo + contraseña), cuentas reales
  en Postgres vía Prisma, sesión JWT, rutas protegidas por `src/proxy.ts`.
- **Storage cifrado E2EE** (en construcción, ver "Arquitectura E2EE" abajo):
  Prisma + Neon Postgres, `Record` guarda solo blobs cifrados — el backend
  nunca ve contenido en claro.
- **Persistencia legada de Ajustes/Secretario**: Upstash Redis vía
  `@upstash/redis`. `src/lib/storage.ts` expone `getValue`/`setValue` — se
  migrará a la capa E2EE en un bloque posterior.

## Estructura

```
src/app/
  (app)/            rutas protegidas con bottom tab bar
    page.tsx         Inicio / dashboard
    secretario/       módulo completo (agenda, minutas, ministración, etc.)
    gather/           Fase 3 — placeholder
    bautizapp/        Fase 3 — placeholder
    ajustes/          Ajustes compartidos (KV)
  login/, signup/    pantallas de acceso (fuera del tab bar)
  api/auth/          rutas de NextAuth
src/components/      BottomNav, PageHeader, ui/ (Card, Button, Toggle, TextField)
src/lib/             auth.ts, prisma.ts, storage.ts, settings.ts, secretario/
prisma/              schema.prisma + migraciones (User, Record cifrado)
reference/           HTML de referencia funcional (prototipos originales, no se despliegan)
```

## Configuración local

```bash
cp .env.example .env
npx auth secret            # genera AUTH_SECRET
# DATABASE_URL / DIRECT_URL: un Postgres local o un proyecto de Neon
npm install                 # corre `prisma generate` automáticamente
npx prisma migrate dev      # aplica el schema a tu base de datos
npm run dev
```

Variables de entorno (ver `.env.example`):

- `DATABASE_URL` (pooled) y `DIRECT_URL` (directa) — Neon Dashboard → Connect.
- `AUTH_SECRET`.
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` (o `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN`) — se generan solos al conectar la integración
  de Upstash Redis en el proyecto de Vercel. Necesarias mientras Ajustes y
  Secretario sigan sobre Redis.

## Arquitectura E2EE (en construcción, bloque por bloque)

Ver el prompt original en el historial del proyecto. Progreso:

1. ✅ Schema de Prisma (`User` + `Record`).
2. ✅ Auth con NextAuth Credentials sobre Prisma (bcrypt, cuentas reales).
3. ⬜ Cripto en el cliente (`lib/crypto.ts`, WebCrypto: PBKDF2 + AES-GCM).
4. ⬜ Storage local en IndexedDB (offline-first).
5. ⬜ API `/api/records` ciega al contenido (solo mueve blobs cifrados).
6. ⬜ Sync cliente (pull/push, last-write-wins por `updatedAt`).
7. ⬜ Pantalla de consentimiento de un solo uso.
8. ⬜ Módulo de prueba `eq_ministracion`.

## Fases de producto

1. **Fase 1**: setup del proyecto, PWA instalable, auth, Ajustes
   compartidos conectados a KV, shell de navegación (bottom tab bar) según
   el handoff de diseño.
2. **Fase 2**: migración 1:1 del módulo Secretario desde
   `reference/centro-de-servicio.html` a componentes React con estado real.
3. **Fase 3**: integración de Gather y BautizApp desde sus propios archivos
   de referencia.
