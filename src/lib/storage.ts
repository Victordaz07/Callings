import { redis } from "@/lib/redis";

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
