import { getRedis } from "./redis.js";

/**
 * First-party, cookie-less analytics stored in Redis.
 *  - one hash per UTC day:  pa:d:YYYY-MM-DD  (fields are "<kind>|<value>")
 *  - one HyperLogLog per day for unique visitors: pa:uv:YYYY-MM-DD
 * Visitors are an anonymous random id generated in the browser; no IPs stored.
 */
export const KEEP_SECONDS = 60 * 60 * 24 * 400;

export type TrackPayload = {
  type: "view" | "event";
  path?: string;
  name?: string;
  ref?: string;
  vid?: string;
  isNew?: boolean;
  device?: string;
  browser?: string;
};

export type CountRow = { key: string; count: number };

export type Insights = {
  totals: { views: number; visitors: number; newVisitors: number; events: number };
  previous: { views: number; visitors: number };
  daily: { date: string; views: number; visitors: number }[];
  pages: CountRow[];
  projects: CountRow[];
  referrers: CountRow[];
  countries: CountRow[];
  devices: CountRow[];
  browsers: CountRow[];
  events: CountRow[];
};

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptime|curl|wget|python-requests/i;

export function isBot(userAgent: string | undefined): boolean {
  return !userAgent || BOT_RE.test(userAgent);
}

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const clean = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/[|\s]+/g, " ").trim().slice(0, max) : "";

export async function recordHit(
  payload: TrackPayload,
  country: string | undefined
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  const day = dayKey(new Date());
  const hashKey = `pa:d:${day}`;
  const p = redis.pipeline();

  if (payload.type === "view") {
    const path = clean(payload.path, 80) || "/";
    p.hincrby(hashKey, "v", 1);
    p.hincrby(hashKey, `p|${path}`, 1);
    p.hincrby(hashKey, `r|${clean(payload.ref, 60) || "direct"}`, 1);
    p.hincrby(hashKey, `c|${clean(country, 2).toUpperCase() || "??"}`, 1);
    p.hincrby(hashKey, `d|${clean(payload.device, 12) || "desktop"}`, 1);
    p.hincrby(hashKey, `b|${clean(payload.browser, 20) || "Other"}`, 1);
    if (payload.isNew) p.hincrby(hashKey, "nv", 1);
    const vid = clean(payload.vid, 64);
    if (vid) {
      p.pfadd(`pa:uv:${day}`, vid);
      p.expire(`pa:uv:${day}`, KEEP_SECONDS);
    }
  } else {
    const name = clean(payload.name, 40);
    if (!name) return false;
    p.hincrby(hashKey, `e|${name}`, 1);
  }
  p.expire(hashKey, KEEP_SECONDS);
  await p.exec();
  return true;
}

function bump(map: Map<string, number>, key: string, n: number) {
  map.set(key, (map.get(key) ?? 0) + n);
}

const top = (map: Map<string, number>, limit = 8): CountRow[] =>
  [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

/** Pure: fold per-day hashes into the numbers the Insights page shows. */
export function aggregate(
  days: { date: string; hash: Record<string, number>; visitors: number }[]
): Omit<Insights, "previous"> {
  const pages = new Map<string, number>();
  const referrers = new Map<string, number>();
  const countries = new Map<string, number>();
  const devices = new Map<string, number>();
  const browsers = new Map<string, number>();
  const events = new Map<string, number>();
  let views = 0;
  let newVisitors = 0;

  const daily = days.map(({ date, hash, visitors }) => {
    let dayViews = 0;
    for (const [field, raw] of Object.entries(hash)) {
      const n = Number(raw) || 0;
      if (field === "v") {
        dayViews = n;
        views += n;
      } else if (field === "nv") newVisitors += n;
      else {
        const i = field.indexOf("|");
        const kind = field.slice(0, i);
        const val = field.slice(i + 1);
        if (kind === "p") bump(pages, val, n);
        else if (kind === "r") bump(referrers, val, n);
        else if (kind === "c") bump(countries, val, n);
        else if (kind === "d") bump(devices, val, n);
        else if (kind === "b") bump(browsers, val, n);
        else if (kind === "e") bump(events, val, n);
      }
    }
    return { date, views: dayViews, visitors };
  });

  const projects = new Map<string, number>();
  for (const [path, n] of pages) {
    const m = path.match(/^\/projects\/([^/]+)/);
    if (m) bump(projects, m[1], n);
  }

  const eventTotal = [...events.values()].reduce((a, b) => a + b, 0);
  return {
    totals: { views, visitors: 0, newVisitors, events: eventTotal },
    daily,
    pages: top(pages),
    projects: top(projects),
    referrers: top(referrers),
    countries: top(countries),
    devices: top(devices, 4),
    browsers: top(browsers, 5),
    events: top(events, 10),
  };
}

export async function readInsights(days: number): Promise<Insights | null> {
  const redis = getRedis();
  if (!redis) return null;

  const today = new Date();
  const keys: string[] = [];
  for (let i = 2 * days - 1; i >= 0; i--) {
    keys.push(dayKey(new Date(today.getTime() - i * 86_400_000)));
  }

  const p = redis.pipeline();
  for (const k of keys) p.hgetall(`pa:d:${k}`);
  for (const k of keys) p.pfcount(`pa:uv:${k}`);
  const out = (await p.exec()) as unknown[];

  const rows = keys.map((date, i) => ({
    date,
    hash: (out[i] as Record<string, number> | null) ?? {},
    visitors: Number(out[keys.length + i]) || 0,
  }));
  const prev = rows.slice(0, days);
  const cur = rows.slice(days);

  // Unique visitors over a range = HLL union, not a sum of daily uniques
  const [curUv, prevUv] = await Promise.all([
    redis.pfcount(...cur.map((r) => `pa:uv:${r.date}`)),
    redis.pfcount(...prev.map((r) => `pa:uv:${r.date}`)),
  ]);

  const agg = aggregate(cur);
  const prevViews = prev.reduce((a, r) => a + (Number(r.hash.v) || 0), 0);
  agg.totals.visitors = Number(curUv) || 0;
  return { ...agg, previous: { views: prevViews, visitors: Number(prevUv) || 0 } };
}
