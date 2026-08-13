import { Redis } from "@upstash/redis";

let client: Redis | null = null;

function redis(): Redis {
  if (!client) {
    const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
    const token =
      process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error(
        "Falta configurar KV: define KV_REST_API_URL/KV_REST_API_TOKEN (integración Upstash de Vercel)."
      );
    }
    client = new Redis({ url, token });
  }
  return client;
}

/**
 * get/set por clave, namespaced por usuario — reemplazo directo del patrón
 * `window.storage.get/set(key)` del prototipo original.
 */
export async function getValue<T>(
  userId: string,
  key: string
): Promise<T | null> {
  const value = await redis().get<T>(namespacedKey(userId, key));
  return value ?? null;
}

export async function setValue<T>(
  userId: string,
  key: string,
  value: T
): Promise<void> {
  await redis().set(namespacedKey(userId, key), value);
}

function namespacedKey(userId: string, key: string): string {
  return `user:${userId}:${key}`;
}
