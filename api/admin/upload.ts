import { put } from "@vercel/blob";
import { verifyAdminCookie } from "../lib-js/adminAuth.js";

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

export default async function handler(
  req: ReqWithBody,
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

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
    return res.status(500).json({ ok: false, message: "Upload failed" });
  }
}
