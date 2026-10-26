import { getRedis } from "./redis.js";

export const SITE_KEY = "portfolio:site";

export type SiteChip = { label: string; live?: boolean };
export type SiteExperience = {
  id: string;
  title: string;
  company: string;
  period: string;
  accentColor: string;
  bullets: string[];
};
export type SiteContent = {
  about: { photoUrl: string; photoAlt: string; body: string; chips: SiteChip[] };
  experience: SiteExperience[];
};

const str = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export function validateSite(input: unknown): { ok: true; site: SiteContent } | { ok: false; message: string } {
  const o = (input ?? {}) as Record<string, unknown>;
  const a = (o.about ?? {}) as Record<string, unknown>;

  const body = str(a.body, 4000);
  if (!body) return { ok: false, message: "About: write something in the text field" };

  const chips: SiteChip[] = [];
  if (Array.isArray(a.chips)) {
    for (const c of a.chips.slice(0, 8)) {
      const r = (c ?? {}) as Record<string, unknown>;
      const label = str(r.label, 40);
      if (label) chips.push({ label, ...(r.live ? { live: true } : {}) });
    }
  }

  if (!Array.isArray(o.experience)) return { ok: false, message: "Experience must be a list" };
  const seen = new Set<string>();
  const experience: SiteExperience[] = [];
  for (const [i, e] of o.experience.slice(0, 20).entries()) {
    const r = (e ?? {}) as Record<string, unknown>;
    const title = str(r.title, 120);
    const company = str(r.company, 120);
    const period = str(r.period, 40);
    if (!title) return { ok: false, message: `Experience ${i + 1}: add a job title` };
    if (!company) return { ok: false, message: `Experience ${i + 1}: add a company` };
    if (!period) return { ok: false, message: `Experience ${i + 1}: add a period` };
    const accentColor = str(r.accentColor, 7);
    if (!/^#[0-9A-Fa-f]{6}$/.test(accentColor)) return { ok: false, message: `Experience ${i + 1}: accent color must be #RRGGBB` };
    let id = str(r.id, 60).toLowerCase().replace(/[^a-z0-9-]+/g, "-") || `job-${i + 1}`;
    while (seen.has(id)) id += "-x";
    seen.add(id);
    const bullets = Array.isArray(r.bullets)
      ? r.bullets.map((b) => str(b, 500)).filter(Boolean).slice(0, 12)
      : [];
    experience.push({ id, title, company, period, accentColor, bullets });
  }

  return {
    ok: true,
    site: {
      about: { photoUrl: str(a.photoUrl, 600), photoAlt: str(a.photoAlt, 200), body, chips },
      experience,
    },
  };
}

export async function getSite(): Promise<SiteContent | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<string | SiteContent>(SITE_KEY);
    if (!raw) return null;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const v = validateSite(parsed);
    return v.ok ? v.site : null;
  } catch (e) {
    console.error("getSite error:", e);
    return null;
  }
}
