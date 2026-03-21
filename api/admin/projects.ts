import { verifyAdminCookie } from "../lib-js/adminAuth.js";
import { getRedis, PROJECTS_KEY } from "../lib-js/redis.js";
import { validateProjectsPayload } from "../lib-js/validateProjects.js";

type ReqWithBody = {
  method?: string;
  headers?: { cookie?: string };
  body?: { projects?: unknown };
};

export default async function handler(
  req: ReqWithBody,
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "PUT") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return res.status(503).json({ ok: false, message: "ADMIN_PASSWORD is not set" });
  }

  if (!verifyAdminCookie(req.headers?.cookie, password)) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(503).json({
      ok: false,
      message:
        "Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel (and redeploy) or in .env.local for vercel dev. Create a free DB at upstash.com.",
    });
  }

  const validated = validateProjectsPayload({ projects: req.body?.projects });
  if (!validated.ok) {
    return res.status(400).json({ ok: false, message: validated.message });
  }

  try {
    await redis.set(PROJECTS_KEY, JSON.stringify(validated.projects));
    return res.status(200).json({ ok: true, count: validated.projects.length });
  } catch (e) {
    console.error("admin/projects save error:", e);
    return res.status(500).json({ ok: false, message: "Failed to save projects" });
  }
}
