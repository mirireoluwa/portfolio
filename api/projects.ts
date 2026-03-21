import { getRedis, PROJECTS_KEY } from "./lib-js/redis.js";
import type { ValidatedProject } from "./lib/validateProjects";

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
      const raw = await redis.get<string>(PROJECTS_KEY);
      if (raw) {
        const parsed =
          typeof raw === "string"
            ? (JSON.parse(raw) as ValidatedProject[])
            : (raw as unknown as ValidatedProject[]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.status(200).json({ ok: true, source: "cms", projects: parsed });
        }
      }
    }
  } catch (e) {
    console.error("GET /api/projects redis error:", e);
  }

  return res.status(200).json({ ok: true, source: "default", projects: null });
}
