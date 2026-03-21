import { clearAdminCookieHeader } from "../lib-js/adminAuth.js";

export default async function handler(
  req: { method?: string },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  res.setHeader("Set-Cookie", clearAdminCookieHeader());
  return res.status(200).json({ ok: true });
}
