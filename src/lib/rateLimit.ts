import { redis } from "@/lib/redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 120;

/**
 * Rate limit básico de ventana fija sobre Redis (Upstash) — evita que un
 * bug de cliente o un uso abusivo golpee /api/records sin parar. 120
 * req/min por usuario da margen a un pull inicial grande o a un push de
 * varios registros tras estar offline, sin abrir la puerta a un loop.
 *
 * Nota de alcance: esto solo corre DESPUÉS de autenticar, así que protege
 * /api/records pero no cubre fuerza bruta contra /login o /signup —
 * quedó fuera de este bloque a propósito, es un problema distinto
 * (intentos de contraseña, no abuso de un usuario ya autenticado).
 */
export async function checkRateLimit(
  key: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowId = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const windowKey = `ratelimit:${key}:${windowId}`;

  const count = await redis().incr(windowKey);
  if (count === 1) {
    await redis().expire(windowKey, WINDOW_SECONDS);
  }

  return { allowed: count <= MAX_REQUESTS, remaining: Math.max(0, MAX_REQUESTS - count) };
}
