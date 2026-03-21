import { verifyAdminCookie } from "../lib-js/adminAuth.js";

export default async function handler(
  req: { method?: string; headers?: { cookie?: string } },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return res.status(200).json({ ok: false, configured: false, message: "Admin not configured" });
  }

  const ok = verifyAdminCookie(req.headers?.cookie, password);
  return res.status(200).json({ ok, configured: true });
}
