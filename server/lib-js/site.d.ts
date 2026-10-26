export type SiteChip = { label: string; live?: boolean };
export type SiteExperience = { id: string; title: string; company: string; period: string; accentColor: string; bullets: string[] };
export type SiteContent = {
  about: { photoUrl: string; photoAlt: string; body: string; chips: SiteChip[] };
  experience: SiteExperience[];
};
export const SITE_KEY: string;
export function validateSite(input: unknown): { ok: true; site: SiteContent } | { ok: false; message: string };
export function getSite(): Promise<SiteContent | null>;
