import { verifyAdminCookie } from "../../server/lib-js/adminAuth.js";
import { readInsights } from "../../server/lib-js/analytics.js";
import { getRedis, PROJECTS_KEY } from "../../server/lib-js/redis.js";
import { getResumeInfo } from "../../server/lib-js/resume.js";

export default async function handler(
  req: { method?: string; headers?: { cookie?: string }; query?: { days?: string } },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") return res.status(405).json({ ok: false, message: "Method not allowed" });

  const password = process.env.ADMIN_PASSWORD;
  if (!password) return res.status(503).json({ ok: false, message: "ADMIN_PASSWORD is not set" });
  if (!verifyAdminCookie(req.headers?.cookie, password)) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(200).json({
      ok: true,
      configured: false,
      message: "Redis isn't configured, so no analytics can be stored. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    });
  }

  const requested = Number(req.query?.days);
  const days = [7, 30, 90].includes(requested) ? requested : 30;

  try {
    const [insights, resume, rawProjects] = await Promise.all([
      readInsights(days),
      getResumeInfo(),
      redis.get<unknown>(PROJECTS_KEY),
    ]);
    const projects = Array.isArray(rawProjects)
      ? rawProjects
      : typeof rawProjects === "string"
        ? (JSON.parse(rawProjects) as unknown[])
        : [];
    return res.status(200).json({
      ok: true,
      configured: true,
      days,
      insights,
      content: {
        projectCount: projects.length,
        resume: { source: resume.source, updatedAt: resume.updatedAt, url: resume.url },
      },
    });
  } catch (e) {
    console.error("admin/insights error:", e);
    return res.status(500).json({ ok: false, message: "Failed to read analytics" });
  }
}
