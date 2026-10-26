import { verifyAdminCookie } from "../../server/lib-js/adminAuth.js";
import { getRedis } from "../../server/lib-js/redis.js";
import { SITE_KEY, validateSite } from "../../server/lib-js/site.js";

export default async function handler(
  req: { method?: string; headers?: { cookie?: string }; body?: { site?: unknown } },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "PUT") return res.status(405).json({ ok: false, message: "Method not allowed" });

  const password = process.env.ADMIN_PASSWORD;
  if (!password) return res.status(503).json({ ok: false, message: "ADMIN_PASSWORD is not set" });
  if (!verifyAdminCookie(req.headers?.cookie, password)) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const redis = getRedis();
  if (!redis) return res.status(503).json({ ok: false, message: "Redis not configured." });

  const v = validateSite(req.body?.site);
  if (!v.ok) return res.status(400).json({ ok: false, message: v.message });

  try {
    await redis.set(SITE_KEY, JSON.stringify(v.site));
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("admin/site save error:", e);
    return res.status(500).json({ ok: false, message: "Failed to save" });
  }
}
