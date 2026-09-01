import { DEFAULT_RESUME_URL, getRedis, RESUME_KEY } from "./lib-js/redis.js";

type ResumeMeta = { url: string; updatedAt?: string };

export default async function handler(
  req: { method?: string },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const redis = getRedis();
    if (redis) {
      const raw = await redis.get<string | ResumeMeta>(RESUME_KEY);
      if (raw) {
        const meta: ResumeMeta =
          typeof raw === "string"
            ? (JSON.parse(raw) as ResumeMeta)
            : (raw as ResumeMeta);
        if (meta.url?.trim()) {
          return res.status(200).json({
            ok: true,
            source: "cms",
            url: meta.url,
            updatedAt: meta.updatedAt ?? null,
          });
        }
      }
    }
  } catch (e) {
    console.error("GET /api/resume redis error:", e);
  }

  return res.status(200).json({ ok: true, source: "default", url: DEFAULT_RESUME_URL, updatedAt: null });
}
