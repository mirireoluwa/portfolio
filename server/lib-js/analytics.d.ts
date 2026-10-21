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
export function isBot(userAgent: string | undefined): boolean;
export function recordHit(payload: TrackPayload, country: string | undefined): Promise<boolean>;
export function readInsights(days: number): Promise<Insights | null>;
export const KEEP_SECONDS: number;
