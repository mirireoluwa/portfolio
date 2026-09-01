import { put } from "@vercel/blob";
import { verifyAdminCookie } from "../../server/lib-js/adminAuth.js";
import { getRedis, RESUME_KEY } from "../../server/lib-js/redis.js";

type ReqWithBody = {
  method?: string;
  headers?: { cookie?: string };
  body?: { filename?: string; dataUrl?: string; type?: string };
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
const RESUME_BLOB_PATHNAME = "portfolio/resume.pdf";

function blobErrorMessage(e: unknown, fallback: string): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/token|unauthori|forbidden|401|403|invalid/i.test(raw)) {
    return `Blob auth failed: ${raw.slice(0, 160)}. Regenerate the read-write token in Vercel Storage → Blob → connect env, redeploy.`;
  }
  if (/private|public access|access.*not|must be public|x-vercel-blob-access/i.test(raw)) {
    return "This Blob store is set to private (or disallows public files). The CMS uploads files as public so they show on your portfolio. In Vercel → Storage → Blob: use a store that allows public blobs, or turn off private-only mode, then try again.";
  }
  if (/size|large|413|body|payload|length/i.test(raw)) {
    return "Request or file too large for the server (Vercel ~4.5MB limit for the whole request). Use a file under ~2.5MB or paste a URL instead.";
  }
  if (raw && raw.length < 180) return raw;
  return fallback;
}

async function uploadResume(
  req: ReqWithBody,
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
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
    const blob = await put(RESUME_BLOB_PATHNAME, buf, {
      access: "public",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const updatedAt = new Date().toISOString();
    await redis.set(RESUME_KEY, JSON.stringify({ url: blob.url, updatedAt }));

    return res.status(200).json({ ok: true, url: blob.url, updatedAt });
  } catch (e) {
    console.error("resume upload error:", e);
    return res.status(500).json({
      ok: false,
      message: blobErrorMessage(e, "Résumé upload failed. Check Vercel Blob configuration and try again."),
    });
  }
}

async function uploadSnapshot(
  req: ReqWithBody,
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  const filename =
    typeof req.body?.filename === "string" && req.body.filename.trim()
      ? req.body.filename.trim().replace(/[^a-zA-Z0-9._-]/g, "_")
      : "upload.png";
  const dataUrl = typeof req.body?.dataUrl === "string" ? req.body.dataUrl : "";
  if (!dataUrl) {
    return res.status(400).json({ ok: false, message: "dataUrl is required" });
  }

  const buf = dataUrlToBuffer(dataUrl);
  if (!buf || buf.length === 0) {
    return res.status(400).json({ ok: false, message: "Invalid data URL" });
  }
  if (buf.length > MAX_BYTES) {
    return res.status(413).json({ ok: false, message: "Image too large (max 4MB)" });
  }

  try {
    const pathname = `portfolio/${Date.now()}-${filename}`;
    const blob = await put(pathname, buf, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return res.status(200).json({ ok: true, url: blob.url });
  } catch (e) {
    console.error("blob upload error:", e);
    return res.status(500).json({
      ok: false,
      message: blobErrorMessage(
        e,
        "Blob upload failed. In Vercel: open your Blob store → ensure this project has a read-write token, copy BLOB_READ_WRITE_TOKEN to env, redeploy."
      ),
    });
  }
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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      ok: false,
      message:
        "Vercel Blob not configured. Add BLOB_READ_WRITE_TOKEN or paste an image URL manually in the snapshot field.",
    });
  }

  const uploadType = typeof req.body?.type === "string" ? req.body.type : "snapshot";

  if (req.method === "PUT" || uploadType === "resume") {
    if (req.method !== "PUT" && req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }
    return uploadResume(req, res);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  return uploadSnapshot(req, res);
}
