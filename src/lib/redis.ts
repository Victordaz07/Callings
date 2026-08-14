import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function redis(): Redis {
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
