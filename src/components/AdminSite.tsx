import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { SiteContent, SiteExperience } from "../types/site";
import { ColorField, Field, inputClass } from "./adminFields";
import { Spinner } from "./Spinner";

export function siteIssues(site: SiteContent): string[] {
  const out: string[] = [];
  if (!site.about.body.trim()) out.push("About text is empty");
  site.experience.forEach((e, i) => {
    if (!e.title.trim() || !e.company.trim() || !e.period.trim()) out.push(`Job ${i + 1} is missing a title, company or period`);
  });
  return out;
}

export function newExperience(): SiteExperience {
  return { id: `job-${Date.now().toString(36)}`, title: "", company: "", period: String(new Date().getFullYear()), accentColor: "#4CB3FF", bullets: [] };
}

async function uploadImage(file: File): Promise<string> {
  if (file.size > 2.5 * 1024 * 1024) {
    throw new Error(`This file is ${(file.size / 1048576).toFixed(1)}MB. Use one under 2.5MB.`);
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Couldn't read the file."));
    r.readAsDataURL(file);
  });
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ filename: file.name, dataUrl }),
  });
  let data: { ok?: boolean; url?: string; message?: string } = {};
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned HTTP ${res.status}. The image may be too large.`);
  }
  if (!res.ok || !data.ok || !data.url) throw new Error(data.message || `Upload failed (HTTP ${res.status}).`);
  return data.url;
}

type Shared = {
  site: SiteContent;
  setSite: (s: SiteContent) => void;
  dirty: boolean;
  saving: boolean;
  status: string | null;
  onPublish: () => void;
};

function Header({ title, blurb, s }: { title: string; blurb: string; s: Shared }) {
  const issues = siteIssues(s.site);
  const can = s.dirty && !s.saving && issues.length === 0;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold lowercase tracking-tight text-zinc-50">{title}</h1>
          <p className="mt-1 max-w-[52ch] text-xs text-zinc-400">{blurb}</p>
        </div>
        <button
          type="button"
          disabled={!can}
          onClick={s.onPublish}
          className="inline-flex items-center gap-2 rounded-lg bg-adminAccent px-4 py-2 text-[10px] font-dmMono font-medium uppercase tracking-[0.18em] text-zinc-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {s.saving && <Spinner />}
          {s.saving ? "publishing…" : "publish"}
          {s.dirty && !s.saving && <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" aria-label="unpublished changes" />}
        </button>
      </div>
      <div aria-live="polite" className="min-h-[1rem] text-xs font-dmMono">
        {s.status ? <p className="text-zinc-200">{s.status}</p> : issues.length ? <p className="text-red-300">{issues[0]}</p> : s.dirty ? <p className="text-zinc-300">You have unpublished changes.</p> : null}
      </div>
    </>
  );
}

/* ───────────────────────── About ───────────────────────── */

export function AboutEditor(s: Shared) {
  const { site, setSite } = s;
  const a = site.about;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<SiteContent["about"]>) => setSite({ ...site, about: { ...a, ...patch } });

  const onFile = async (f: File) => {
    setError(null);
    setUploading(true);
    try {
      set({ photoUrl: await uploadImage(f) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <Header title="about" blurb="The photo and text in the About section of the site." s={s} />

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-xl border border-white/10 bg-zinc-900/40 p-4 sm:p-5">
          <h2 className="text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-300">photo</h2>
          <div className="aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
            {a.photoUrl ? (
              <img src={a.photoUrl} alt={a.photoAlt} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-500">no photo</div>
            )}
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-100 focus-within:ring-2 focus-within:ring-white/60 hover:bg-white/5">
            {uploading ? "uploading…" : a.photoUrl ? "replace photo" : "upload photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
                e.target.value = "";
              }}
            />
          </label>
          {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
          <Field label="alt text" hint="Describe the photo for people who can't see it.">
            {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className={inputClass()} value={a.photoAlt} onChange={(e) => set({ photoAlt: e.target.value })} />}
          </Field>
          <p className="text-[11px] text-zinc-400">Portrait works best (4:5). Under 2.5MB.</p>
        </section>

        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-white/10 bg-zinc-900/40 p-4 sm:p-5">
            <h2 className="text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-300">text</h2>
            <Field label="about you" required hint="A blank line starts a new paragraph. Link with [label](https://example.com)." error={a.body.trim() ? null : "Write something here"}>
              {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className={`${inputClass()} min-h-[260px] resize-y leading-relaxed`} value={a.body} onChange={(e) => set({ body: e.target.value })} />}
            </Field>
          </section>

          <section className="space-y-4 rounded-xl border border-white/10 bg-zinc-900/40 p-4 sm:p-5">
            <div>
              <h2 className="text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-300">badges</h2>
              <p className="mt-1.5 text-[11px] text-zinc-400">Small labels under the text. Turn on the dot for a live status.</p>
            </div>
            <ul className="space-y-2">
              {a.chips.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    aria-label={`Badge ${i + 1} text`}
                    className={inputClass("min-w-0 flex-1")}
                    value={c.label}
                    onChange={(e) => set({ chips: a.chips.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                  />
                  <label className="flex shrink-0 items-center gap-1.5 text-[10px] font-dmMono uppercase tracking-[0.12em] text-zinc-300">
                    <input
                      type="checkbox"
                      checked={!!c.live}
                      onChange={(e) => set({ chips: a.chips.map((x, j) => (j === i ? { ...x, live: e.target.checked } : x)) })}
                      className="h-4 w-4 accent-[#9DCFEF]"
                    />
                    dot
                  </label>
                  <button type="button" aria-label={`Remove badge ${c.label || i + 1}`} onClick={() => set({ chips: a.chips.filter((_, j) => j !== i) })} className="h-9 w-9 shrink-0 rounded-lg text-zinc-300 hover:bg-white/5">×</button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={a.chips.length >= 8}
              onClick={() => set({ chips: [...a.chips, { label: "" }] })}
              className="rounded-lg border border-dashed border-white/20 px-4 py-2 text-[10px] font-dmMono uppercase tracking-[0.16em] text-zinc-200 hover:bg-white/5 disabled:opacity-40"
            >
              + add badge
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Experience ─────────────────────── */

function Panel({ title, onClose, footer, children }: { title: string; onClose: () => void; footer: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, []);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key !== "Tab" || !ref.current) return;
    const f = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === ref.current || active === first)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };
  return (
    <div className="fixed inset-0 z-[70]" onKeyDown={onKeyDown}>
      <div className="admin-overlay-in absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="exp-title" className="admin-panel-in absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col border-l border-white/10 bg-zinc-950 shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.9)] focus:outline-none">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 id="exp-title" className="truncate text-xl font-semibold tracking-tight text-zinc-50">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close editor" className="h-9 w-9 shrink-0 rounded-lg border border-white/10 text-lg leading-none text-zinc-300 hover:bg-white/5">×</button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">{children}</div>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">{footer}</div>
      </div>
    </div>
  );
}

export function ExperienceEditor(s: Shared) {
  const { site, setSite } = s;
  const [open, setOpen] = useState<number | null>(null);
  const items = site.experience;
  const update = (i: number, patch: Partial<SiteExperience>) => setSite({ ...site, experience: items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setSite({ ...site, experience: next });
    setOpen((o) => (o === i ? j : o === j ? i : o));
  };
  const remove = (i: number) => {
    if (!confirm(`Delete ${items[i].title || "this job"}? It leaves the site when you publish.`)) return;
    setSite({ ...site, experience: items.filter((_, j) => j !== i) });
    setOpen(null);
  };
  const add = () => {
    setSite({ ...site, experience: [newExperience(), ...items] });
    setOpen(0);
  };
  const cur = open !== null ? items[open] : null;

  return (
    <div className="space-y-8 pb-24">
      <Header title="experience" blurb="Jobs and internships, newest first. Order here is the order on the site." s={s} />
      <div>
        <button type="button" onClick={add} className="rounded-lg border border-white/15 px-3 py-2 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-100 hover:bg-white/5">+ add job</button>
      </div>

      <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40">
        {items.map((e, i) => (
          <li key={e.id} className="flex items-center gap-3 p-3 sm:p-4">
            <button type="button" onClick={() => setOpen(i)} aria-label={`Edit ${e.title || "untitled job"}`} className="flex min-w-0 flex-1 items-center gap-4 rounded-lg text-left">
              <span className="w-14 shrink-0 font-dmMono text-[11px] text-zinc-400">{e.period}</span>
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-zinc-50">{e.title || "untitled job"}</span>
                <span className="mt-0.5 flex items-center gap-2 truncate text-xs text-zinc-300">
                  <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: e.accentColor }} aria-hidden />
                  {e.company || "no company"} · {e.bullets.length} point{e.bullets.length === 1 ? "" : "s"}
                </span>
              </span>
            </button>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${e.title || "job"} up`} className="h-9 w-9 rounded-lg text-zinc-300 hover:bg-white/5 disabled:opacity-25">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${e.title || "job"} down`} className="h-9 w-9 rounded-lg text-zinc-300 hover:bg-white/5 disabled:opacity-25">↓</button>
              <button type="button" onClick={() => setOpen(i)} className="ml-1 hidden rounded-lg border border-white/15 px-3 py-2 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-100 hover:bg-white/5 sm:inline-block">edit</button>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="p-8 text-center text-sm text-zinc-400">No jobs yet. Add your first one.</li>}
      </ul>

      {cur && open !== null && (
        <Panel
          title={cur.title || "new job"}
          onClose={() => setOpen(null)}
          footer={
            <>
              <button type="button" onClick={() => remove(open)} className="rounded-lg px-2 py-2 text-[10px] font-dmMono uppercase tracking-[0.16em] text-red-300 hover:bg-red-400/10">delete job</button>
              <button type="button" onClick={() => setOpen(null)} className="rounded-lg bg-adminAccent px-5 py-2.5 text-[10px] font-dmMono font-medium uppercase tracking-[0.2em] text-zinc-950 hover:opacity-90">done</button>
            </>
          }
        >
          <Field label="job title" required error={cur.title.trim() ? null : "Add a job title"}>
            {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className={inputClass()} value={cur.title} onChange={(e) => update(open, { title: e.target.value })} />}
          </Field>
          <Field label="company" required error={cur.company.trim() ? null : "Add a company"}>
            {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className={inputClass()} value={cur.company} onChange={(e) => update(open, { company: e.target.value })} />}
          </Field>
          <Field label="period" required hint="For example 2025, or Jun 2024 to Aug 2024" error={cur.period.trim() ? null : "Add a period"}>
            {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className={inputClass("font-dmMono")} value={cur.period} onChange={(e) => update(open, { period: e.target.value })} />}
          </Field>
          <ColorField label="company color" hint="The small square next to the company name." value={cur.accentColor} onChange={(hex) => update(open, { accentColor: hex })} />
          <Field label="what you did" hint="One point per line. The first two show on the site, the rest sit behind “more”.">
            {({ id, describedBy }) => (
              <textarea
                id={id}
                aria-describedby={describedBy}
                className={`${inputClass()} min-h-[220px] resize-y leading-relaxed`}
                value={cur.bullets.join("\n")}
                onChange={(e) => update(open, { bullets: e.target.value.split("\n").map((x) => x.trimStart()) })}
              />
            )}
          </Field>
        </Panel>
      )}
    </div>
  );
}
