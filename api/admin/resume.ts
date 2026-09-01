import { put } from "@vercel/blob";
import { verifyAdminCookie } from "../lib-js/adminAuth.js";
import { DEFAULT_RESUME_URL, getRedis, RESUME_KEY } from "../lib-js/redis.js";

type ResumeMeta = { url: string; updatedAt: string };

type ReqWithBody = {
  method?: string;
  headers?: { cookie?: string };
  body?: { filename?: string; dataUrl?: string };
};

function dataUrlToBuffer(dataUrl: string): Buffer | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  try {
    return Buffer.from(m[2], "base64");
  } catch {
    return null;
  }
}

const MAX_BYTES = 4 * 1024 * 1024;
const BLOB_PATHNAME = "portfolio/resume.pdf";

async function getResumeMeta(): Promise<{ url: string; updatedAt: string | null; source: "cms" | "default" }> {
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
        return { url: meta.url, updatedAt: meta.updatedAt ?? null, source: "cms" };
      }
    }
  } catch (e) {
    console.error("admin/resume get error:", e);
  }

  return { url: DEFAULT_RESUME_URL, updatedAt: null, source: "default" };
}

export default async function handler(
  req: ReqWithBody,
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return res.status(503).json({ ok: false, message: "ADMIN_PASSWORD is not set" });
  }

  if (!verifyAdminCookie(req.headers?.cookie, password)) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  if (req.method === "GET") {
    const meta = await getResumeMeta();
    return res.status(200).json({ ok: true, ...meta });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      ok: false,
      message:
        "Vercel Blob not configured. Add BLOB_READ_WRITE_TOKEN in Vercel env and redeploy.",
    });
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(503).json({
      ok: false,
      message:
        "Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel (or .env.local for vercel dev).",
    });
  }

  const dataUrl = typeof req.body?.dataUrl === "string" ? req.body.dataUrl : "";
  if (!dataUrl) {
    return res.status(400).json({ ok: false, message: "dataUrl is required" });
  }

  const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
  const mime = mimeMatch?.[1]?.toLowerCase() ?? "";
  if (mime !== "application/pdf") {
    return res.status(400).json({ ok: false, message: "Only PDF files are allowed" });
  }

  const buf = dataUrlToBuffer(dataUrl);
  if (!buf || buf.length === 0) {
    return res.status(400).json({ ok: false, message: "Invalid data URL" });
  }
  if (buf.length > MAX_BYTES) {
    return res.status(413).json({ ok: false, message: "PDF too large (max 4MB)" });
  }

  try {
    const blob = await put(BLOB_PATHNAME, buf, {
      access: "public",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const meta: ResumeMeta = {
      url: blob.url,
      updatedAt: new Date().toISOString(),
    };
    await redis.set(RESUME_KEY, JSON.stringify(meta));

    return res.status(200).json({ ok: true, url: meta.url, updatedAt: meta.updatedAt });
  } catch (e) {
    console.error("admin/resume upload error:", e);
    const raw = e instanceof Error ? e.message : String(e);
    let message = "Resume upload failed. Check Vercel Blob configuration and try again.";
    if (/token|unauthori|forbidden|401|403|invalid/i.test(raw)) {
      message = `Blob auth failed: ${raw.slice(0, 160)}. Regenerate BLOB_READ_WRITE_TOKEN in Vercel Storage → Blob.`;
    } else if (/private|public access|access.*not|must be public/i.test(raw)) {
      message =
        "This Blob store disallows public files. The résumé must be publicly accessible on your portfolio.";
    } else if (/size|large|413|body|payload|length/i.test(raw)) {
      message =
        "PDF too large for the server (Vercel ~4.5MB request limit). Use a compressed PDF under ~2.5MB.";
    } else if (raw && raw.length < 180) {
      message = raw;
    }
    return res.status(500).json({ ok: false, message });
  }
}
