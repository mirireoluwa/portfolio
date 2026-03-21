import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Redis } from "@upstash/redis";

const PROJECTS_KEY = "portfolio:projects";

/** `vercel dev` often does not inject `.env.local` into serverless `process.env` — load it here for local CMS. */
function ensureLocalEnvLoaded(): void {
  const hasPair = (url?: string, token?: string) =>
    Boolean(url?.trim() && token?.trim());

  if (
    hasPair(process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN) ||
    hasPair(process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN)
  ) {
    return;
  }

  // Walk up from cwd — vercel dev sometimes uses a subfolder as cwd
  let dir = process.cwd();
  for (let step = 0; step < 10; step++) {
    for (const name of [".env.local", ".env"] as const) {
      const p = resolve(dir, name);
      if (existsSync(p)) {
        config({ path: p });
        return;
      }
    }
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
}

ensureLocalEnvLoaded();

export function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() || process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || process.env.KV_REST_API_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  // REST client needs the HTTPS endpoint from Upstash (“REST API”), not redis://
  if (url.startsWith("redis://") || url.startsWith("rediss://")) {
    console.warn(
      "[portfolio] UPSTASH_REDIS_REST_URL must be the https://… REST URL from the Upstash console, not redis://"
    );
    return null;
  }

  return new Redis({ url, token });
}

export { PROJECTS_KEY };
