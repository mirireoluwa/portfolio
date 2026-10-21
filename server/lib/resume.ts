import { DEFAULT_RESUME_URL, getRedis, RESUME_KEY } from "./redis.js";

export type ResumeMeta = { url: string; updatedAt?: string };

export type ResumeInfo = {
  url: string;
  updatedAt: string | null;
  source: "cms" | "default";
};

export async function getResumeInfo(): Promise<ResumeInfo> {
  const redis = getRedis();
  if (!redis) {
    return { url: DEFAULT_RESUME_URL, updatedAt: null, source: "default" };
  }

  try {
    const raw = await redis.get<string | ResumeMeta>(RESUME_KEY);
    if (raw) {
      const meta: ResumeMeta =
        typeof raw === "string" ? (JSON.parse(raw) as ResumeMeta) : (raw as ResumeMeta);
      if (meta.url?.trim()) {
        return {
          url: meta.url,
          updatedAt: meta.updatedAt ?? null,
          source: "cms",
        };
      }
    }
  } catch (e) {
    console.error("resume redis error:", e);
  }

  return { url: DEFAULT_RESUME_URL, updatedAt: null, source: "default" };
}
