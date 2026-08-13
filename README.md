# Centro de Servicio

PWA personal para herramientas de llamamientos de La Iglesia de Jesucristo de
los Santos de los Últimos Días. Hub con módulos independientes: **Secretario**,
**Gather** (líder misional) y **BautizApp**, más **Ajustes** compartidos entre
los tres.

## Stack

- **Next.js 16 (App Router) + TypeScript** — Vercel es su casa natural.
- **Tailwind CSS v4**, tokens de color/tipografía definidos en
  `src/app/globals.css` (`@theme`), tomados 1:1 del sistema de diseño del
  proyecto (paleta deep-water/dawn-coral, Fraunces + Karla).
- **PWA**: `src/app/manifest.ts` + `public/sw.js` (service worker manual,
  sin dependencias de terceros) — precache del shell y fallback offline en
  `/offline`. Solo usa Cache API y fetch, compatible con un futuro WebView de
  Capacitor.
- **Auth**: NextAuth v5 con un proveedor Credentials (correo + código de
  acceso). Un solo usuario autorizado (`APP_OWNER_EMAIL` +
  `APP_PASSCODE_HASH` con bcrypt), sesión JWT, rutas protegidas por
  `src/middleware.ts`.
- **Persistencia**: Upstash Redis (integración de Vercel Marketplace,
  sucesora de Vercel KV) vía `@upstash/redis`. `src/lib/storage.ts` expone
  `getValue(userId, key)` / `setValue(userId, key, value)` — reemplazo
  directo del patrón `window.storage.get/set(key)` del prototipo original.

## Estructura

```
src/app/
  (app)/            rutas protegidas con bottom tab bar
    page.tsx         Inicio / dashboard
    secretario/       Fase 2 — placeholder por ahora
    gather/           Fase 3 — placeholder
    bautizapp/        Fase 3 — placeholder
    ajustes/          Ajustes compartidos (KV)
  login/             pantalla de acceso (fuera del tab bar)
  api/auth/          rutas de NextAuth
src/components/      BottomNav, PageHeader, ui/ (Card, Button, Toggle, TextField)
src/lib/             auth.ts, storage.ts, settings.ts
reference/           HTML de referencia funcional (prototipos originales, no se despliegan)
```

## Configuración local

```bash
cp .env.example .env.local
npx auth secret            # genera AUTH_SECRET
node scripts/hash-passcode.mjs "tu-codigo-secreto"   # genera APP_PASSCODE_HASH
npm install
npm run dev
```

Variables de entorno (ver `.env.example`):

- `AUTH_SECRET`
- `APP_OWNER_EMAIL`, `APP_PASSCODE_HASH`
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` (o `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN`) — se generan solos al conectar la integración
  de Upstash Redis en el proyecto de Vercel.

## Fases

1. **Fase 1 (este PR)**: setup del proyecto, PWA instalable, auth, Ajustes
   compartidos conectados a KV, shell de navegación (bottom tab bar) según
   el handoff de diseño.
2. **Fase 2**: migración 1:1 del módulo Secretario desde
   `reference/centro-de-servicio.html` a componentes React con estado real.
3. **Fase 3**: integración de Gather y BautizApp desde sus propios archivos
   de referencia.
