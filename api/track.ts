import { isBot, recordHit, type TrackPayload } from "../server/lib-js/analytics.js";

type Req = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export default async function handler(
  req: Req,
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void; end: () => void };
  }
) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const ua = String(req.headers?.["user-agent"] ?? "");
  // Bots and malformed hits are acknowledged but never counted.
  if (isBot(ua)) return res.status(204).end();

  let body: unknown = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(204).end();
    }
  }
  const b = (body ?? {}) as Partial<TrackPayload>;
  if (b.type !== "view" && b.type !== "event") return res.status(204).end();

  try {
    await recordHit(b as TrackPayload, String(req.headers?.["x-vercel-ip-country"] ?? ""));
  } catch (e) {
    console.error("track error:", e);
  }
  return res.status(204).end();
}
