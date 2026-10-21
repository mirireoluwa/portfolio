import { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "./Spinner";

type CountRow = { key: string; count: number };
type Insights = {
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
type Payload =
  | { ok: true; configured: false; message: string }
  | {
      ok: true;
      configured: true;
      days: number;
      insights: Insights | null;
      content: {
        projectCount: number;
        resume: { source: "cms" | "default"; updatedAt: string | null; url: string };
      };
    };

const RANGES = [7, 30, 90] as const;

const EVENT_LABELS: Record<string, string> = {
  resume: "résumé opened",
  contact_email: "email clicked",
  contact_linkedin: "linkedin clicked",
  contact_github: "github clicked",
  project_link: "project site visited",
};

const nf = new Intl.NumberFormat("en");
const pct = (n: number) => `${Math.round(n)}%`;

function delta(now: number, before: number): { label: string; tone: "up" | "down" | "flat" } {
  if (before === 0) return now === 0 ? { label: "no change", tone: "flat" } : { label: "new", tone: "up" };
  const d = ((now - before) / before) * 100;
  if (Math.abs(d) < 1) return { label: "no change", tone: "flat" };
  return { label: `${d > 0 ? "+" : ""}${Math.round(d)}% vs previous`, tone: d > 0 ? "up" : "down" };
}

function countryName(code: string): string {
  if (code === "??") return "unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

const label = "text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-400";
const panel = "rounded-xl border border-white/10 bg-zinc-900/40";

function Kpi({ title, value, note, tone }: { title: string; value: string; note: string; tone?: "up" | "down" | "flat" }) {
  const toneClass = tone === "up" ? "text-emerald-400" : tone === "down" ? "text-red-400" : "text-zinc-400";
  return (
    <div className={`${panel} p-4 sm:p-5`}>
      <p className={label}>{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-zinc-50">{value}</p>
      <p className={`mt-1.5 text-[11px] font-dmMono ${toneClass}`}>{note}</p>
    </div>
  );
}

function BarList({
  title,
  rows,
  format,
  empty = "nothing yet",
}: {
  title: string;
  rows: CountRow[];
  format?: (key: string) => string;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className={`${panel} p-4 sm:p-5`}>
      <h3 className={label}>{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-xs text-zinc-400 font-dmMono">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.key}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate text-zinc-200">{format ? format(r.key) : r.key}</span>
                <span className="shrink-0 font-dmMono tabular-nums text-zinc-400">{nf.format(r.count)}</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-white/[0.06]" aria-hidden>
                <div className="h-full rounded-full bg-adminAccent/80" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function niceMax(n: number): number {
  if (n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  const m = n / pow;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * pow;
}

function TrendChart({ daily }: { daily: Insights["daily"] }) {
  const W = 600;
  const H = 240;
  const pad = { l: 40, r: 12, t: 14, b: 30 };
  const max = niceMax(Math.max(...daily.map((d) => Math.max(d.views, d.visitors)), 1));
  const x = (i: number) => pad.l + (daily.length === 1 ? 0 : (i / (daily.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = (key: "views" | "visitors") => daily.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");
  const area = `${line("views")} L${x(daily.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));
  const fmtDate = (s: string) => new Date(`${s}T00:00:00Z`).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
  const last = daily[daily.length - 1];
  const xLabels = [0, Math.floor((daily.length - 1) / 2), daily.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Daily views and visitors, ${fmtDate(daily[0].date)} to ${fmtDate(last.date)}`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <text x={pad.l - 8} y={y(t) + 3.5} textAnchor="end" fontSize="12.5" fill="#a1a1aa" fontFamily="DM Mono, monospace">{t}</text>
        </g>
      ))}
      <path d={area} fill="rgba(157,207,239,0.12)" />
      <path d={line("views")} fill="none" stroke="#9DCFEF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d={line("visitors")} fill="none" stroke="#e4e4e7" strokeWidth="1.5" strokeDasharray="4 3" strokeLinejoin="round" />
      <circle cx={x(daily.length - 1)} cy={y(last.views)} r="4" fill="#9DCFEF" stroke="#0b0b12" strokeWidth="2" />
      {xLabels.map((i, k) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} fontSize="12.5" fill="#a1a1aa" fontFamily="DM Mono, monospace">
          {fmtDate(daily[i].date)}
        </text>
      ))}
    </svg>
  );
}

export function AdminInsights() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/insights?days=${days}`, { credentials: "include", cache: "no-store" });
      const j = (await r.json()) as Payload & { message?: string };
      if (!r.ok) throw new Error(j.message || "Couldn't load insights");
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load insights");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    if (!data || !data.configured || !data.insights) return null;
    const i = data.insights;
    const best = i.daily.reduce((a, b) => (b.views > a.views ? b : a), i.daily[0]);
    const mobile = i.devices.find((d) => d.key === "mobile")?.count ?? 0;
    const deviceTotal = i.devices.reduce((a, d) => a + d.count, 0);
    const clicks = i.events.reduce((a, e) => a + e.count, 0);
    return {
      best,
      avg: i.totals.views / i.daily.length,
      mobileShare: deviceTotal ? (mobile / deviceTotal) * 100 : 0,
      newShare: i.totals.visitors ? Math.min(100, (i.totals.newVisitors / i.totals.visitors) * 100) : 0,
      engagement: i.totals.visitors ? Math.min(100, (clicks / i.totals.visitors) * 100) : 0,
      viewsDelta: delta(i.totals.views, i.previous.views),
      visitorsDelta: delta(i.totals.visitors, i.previous.visitors),
    };
  }, [data]);

  const fmtDay = (s: string) => new Date(`${s}T00:00:00Z`).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold lowercase tracking-tight text-zinc-50">insights</h1>
          <p className="mt-1 text-xs text-zinc-400">Who's visiting and what they do. Anonymous, first-party, no cookies.</p>
        </div>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Date range" className="inline-flex rounded-lg border border-white/10 bg-zinc-900/60 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDays(r)}
                aria-pressed={days === r}
                className={`rounded-md px-3 py-1.5 text-[10px] font-dmMono uppercase tracking-[0.14em] transition-colors ${
                  days === r ? "bg-adminAccent text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-300 hover:bg-white/5"
          >
            refresh
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-300 font-dmMono">{error}</p>
      )}

      {loading && !data && (
        <div className="flex items-center gap-2.5 py-16 justify-center text-sm text-zinc-400 font-dmMono"><Spinner />Loading insights…</div>
      )}

      {data && !data.configured && (
        <p className={`${panel} p-5 text-sm text-zinc-300`}>{data.message}</p>
      )}

      {data && data.configured && data.insights && stats && (
        <div className={loading ? "opacity-60 transition-opacity space-y-6" : "space-y-6 transition-opacity"}>
          {data.insights.totals.views === 0 && (
            <p className="rounded-lg border border-adminAccent/25 bg-adminAccent/5 px-4 py-3 text-xs leading-relaxed text-zinc-300">
              No visits recorded in the last {days} days. Tracking starts once this version is deployed; your own visits are excluded after you sign in on this browser.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi title="page views" value={nf.format(data.insights.totals.views)} note={stats.viewsDelta.label} tone={stats.viewsDelta.tone} />
            <Kpi title="unique visitors" value={nf.format(data.insights.totals.visitors)} note={stats.visitorsDelta.label} tone={stats.visitorsDelta.tone} />
            <Kpi title="new visitors" value={pct(stats.newShare)} note={`${nf.format(data.insights.totals.newVisitors)} first visits`} />
            <Kpi title="mobile share" value={pct(stats.mobileShare)} note={`${pct(100 - stats.mobileShare)} desktop`} />
          </div>

          <section className={`${panel} p-4 sm:p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className={label}>views over time</h2>
              <div className="flex items-center gap-4 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-400">
                <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-adminAccent" />views</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-zinc-200" />visitors</span>
              </div>
            </div>
            <div className="mt-4"><TrendChart daily={data.insights.daily} /></div>
            <p className="mt-3 text-[11px] font-dmMono text-zinc-400">
              avg {stats.avg.toFixed(1)}/day · best day {fmtDay(stats.best.date)} ({nf.format(stats.best.views)} views) · days are UTC
            </p>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
            <BarList title="top pages" rows={data.insights.pages} empty="no page views yet" />
            <BarList title="most viewed projects" rows={data.insights.projects} empty="no project views yet" />
            <BarList title="where visitors come from" rows={data.insights.referrers} />
            <BarList title="countries" rows={data.insights.countries} format={countryName} />
            <BarList title="devices" rows={data.insights.devices} />
            <BarList title="browsers" rows={data.insights.browsers} />
          </div>

          <section className={`${panel} p-4 sm:p-5`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={label}>what visitors do</h2>
              <p className="text-[11px] font-dmMono text-zinc-400">{pct(stats.engagement)} of visitors clicked something below</p>
            </div>
            {data.insights.events.length === 0 ? (
              <p className="mt-4 text-xs text-zinc-400 font-dmMono">no clicks recorded yet</p>
            ) : (
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {data.insights.events.map((e) => (
                  <li key={e.key} className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] pb-2 text-xs">
                    <span className="text-zinc-200">{EVENT_LABELS[e.key] ?? e.key}</span>
                    <span className="font-dmMono tabular-nums text-zinc-400">{nf.format(e.count)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`${panel} p-4 sm:p-5`}>
            <h2 className={label}>site health</h2>
            <dl className="mt-4 grid gap-4 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-zinc-400">published projects</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-zinc-50">{data.content.projectCount || "bundled defaults"}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">résumé</dt>
                <dd className="mt-1 text-zinc-100">
                  {data.content.resume.source === "cms" ? "uploaded via cms" : "default file"}
                  {data.content.resume.updatedAt && <span className="block text-[11px] font-dmMono text-zinc-400">updated {new Date(data.content.resume.updatedAt).toLocaleDateString()}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-400">tracking</dt>
                <dd className="mt-1 text-zinc-100">on · anonymous · bots excluded</dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
