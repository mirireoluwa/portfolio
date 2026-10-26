import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Project } from "../types/project";
import { PROJECT_CATEGORIES } from "../types/project";
import { ColorField, Field, inputClass, normalizeHex6 } from "./adminFields";
import { Spinner } from "./Spinner";

export type ProjectIssue = { section: SectionId; message: string };
type SectionId = "basics" | "story" | "media" | "details";

/** Everything the CMS refuses to save, grouped by the section it lives in. */
export function projectIssues(p: Project): ProjectIssue[] {
  const out: ProjectIssue[] = [];
  if (!p.title.trim()) out.push({ section: "basics", message: "Add a title" });
  if (!p.slug.trim()) out.push({ section: "basics", message: "Add a URL slug" });
  if (!p.year.trim()) out.push({ section: "basics", message: "Add a year" });
  if (!p.role.trim()) out.push({ section: "basics", message: "Add your role" });
  if (!p.summary.trim()) out.push({ section: "basics", message: "Add a summary" });
  if (!p.description.trim()) out.push({ section: "basics", message: "Add a description" });
  if (p.tags.length === 0) out.push({ section: "details", message: "Add at least one tag" });
  if (!normalizeHex6(p.accentColor) || !normalizeHex6(p.accentTextColor))
    out.push({ section: "details", message: "Fix the card colors" });
  return out;
}

const SECTIONS: { id: SectionId; label: string; blurb: string }[] = [
  { id: "basics", label: "basics", blurb: "What it is, shown on the card and the top of the project page." },
  { id: "story", label: "case study", blurb: "The story behind it. Any section you leave empty is hidden on the site." },
  { id: "media", label: "images", blurb: "Screenshots shown on the project page. The first one is the card cover." },
  { id: "details", label: "details", blurb: "Link, tags and the card's color." },
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((t) => t.trim()).filter(Boolean);
    if (parts.length) onChange([...tags, ...parts.filter((t) => !tags.includes(t))]);
    setDraft("");
  };
  return (
    <Field label="tags" required hint="Press Enter or comma to add. Shown on cards and project pages." error={tags.length ? null : "Add at least one tag"}>
      {({ id, describedBy }) => (
        <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-zinc-950/60 p-2 focus-within:border-white/30">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 py-1 pl-2.5 pr-1 text-xs text-zinc-200">
              {t}
              <button
                type="button"
                onClick={() => onChange(tags.filter((x) => x !== t))}
                aria-label={`Remove tag ${t}`}
                className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
          <input
            id={id}
            aria-describedby={describedBy}
            value={draft}
            onChange={(e) => (e.target.value.endsWith(",") ? (setDraft(e.target.value), add()) : setDraft(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              } else if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1));
            }}
            onBlur={add}
            placeholder={tags.length ? "add another" : "e.g. ui/ux"}
            className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </div>
      )}
    </Field>
  );
}

type Props = {
  project: Project;
  index: number;
  total: number;
  onChange: (patch: Partial<Project>) => void;
  onClose: () => void;
  onDelete: () => void;
  onStep: (dir: -1 | 1) => void;
  upload: {
    uploadingIndex: number | null;
    error: string | null;
    clearError: () => void;
    start: (snapshotIndex: number, file: File) => void;
    add: () => void;
    update: (i: number, patch: { src?: string; alt?: string }) => void;
    remove: (i: number) => void;
  };
  ai: { generating: boolean; error: string | null; run: () => void };
};

export function ProjectEditorPanel({ project: p, index, total, onChange, onClose, onDelete, onStep, upload, ai }: Props) {
  const [section, setSection] = useState<SectionId>("basics");
  const [slugTouched, setSlugTouched] = useState(() => p.slug !== "" && p.slug !== slugify(p.title));
  const panelRef = useRef<HTMLDivElement>(null);
  const issues = projectIssues(p);

  // Focus management: move into the panel on open, return to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, []);

  // A different project was opened (prev/next): start from its first section.
  useEffect(() => {
    setSection("basics");
    setSlugTouched(p.slug !== "" && p.slug !== slugify(p.title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Tab" && panelRef.current) {
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === panelRef.current) {
        e.preventDefault();
        last.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const tabKeys = (e: KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + SECTIONS.length) % SECTIONS.length;
    setSection(SECTIONS[n].id);
    document.getElementById(`tab-${SECTIONS[n].id}`)?.focus();
  };

  const countFor = (id: SectionId) => issues.filter((i) => i.section === id).length;
  const set = (patch: Partial<Project>) => onChange(patch);
  const current = SECTIONS.find((s) => s.id === section)!;

  return (
    <div className="fixed inset-0 z-[70]" onKeyDown={onKeyDown}>
      <div className="admin-overlay-in absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
        className="admin-panel-in absolute inset-y-0 right-0 flex w-full max-w-[600px] flex-col border-l border-white/10 bg-zinc-950 shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.9)] focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-400">
              project {index + 1} of {total}
            </p>
            <h2 id="editor-title" className="mt-1 truncate text-xl font-semibold lowercase tracking-tight text-zinc-50">
              {p.title || "untitled project"}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={() => onStep(-1)} disabled={index === 0} aria-label="Previous project" className="h-9 w-9 rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 disabled:opacity-30">←</button>
            <button type="button" onClick={() => onStep(1)} disabled={index === total - 1} aria-label="Next project" className="h-9 w-9 rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 disabled:opacity-30">→</button>
            <button type="button" onClick={onClose} aria-label="Close editor" className="ml-1 h-9 w-9 rounded-lg border border-white/10 text-lg leading-none text-zinc-300 hover:bg-white/5">×</button>
          </div>
        </div>

        {/* Section tabs */}
        <div role="tablist" aria-label="Project sections" className="flex gap-5 overflow-x-auto border-b border-white/10 px-5">
          {SECTIONS.map((s, i) => {
            const n = countFor(s.id);
            const on = section === s.id;
            return (
              <button
                key={s.id}
                id={`tab-${s.id}`}
                role="tab"
                aria-selected={on}
                aria-controls={`panel-${s.id}`}
                tabIndex={on ? 0 : -1}
                type="button"
                onClick={() => setSection(s.id)}
                onKeyDown={(e) => tabKeys(e, i)}
                className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 py-3 text-[10px] font-dmMono uppercase tracking-[0.18em] transition-colors ${
                  on ? "border-adminAccent text-zinc-50" : "border-transparent text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {s.label}
                {n > 0 && (
                  <span className="rounded-full bg-red-400/15 px-1.5 py-0.5 text-[9px] text-red-300" aria-label={`${n} to fix`}>
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div id={`panel-${section}`} role="tabpanel" aria-labelledby={`tab-${section}`} className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
          <p className="text-xs leading-relaxed text-zinc-400">{current.blurb}</p>

          {section === "basics" && (
            <>
              <Field label="title" required error={p.title.trim() ? null : "Add a title"}>
                {({ id, describedBy }) => (
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    className={inputClass("lowercase")}
                    value={p.title}
                    onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
                  />
                )}
              </Field>
              <Field label="url slug" required hint={`Page lives at /projects/${p.slug || "your-slug"}`} error={p.slug.trim() ? null : "Add a URL slug"}>
                {({ id, describedBy }) => (
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    className={inputClass("font-dmMono lowercase")}
                    value={p.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set({ slug: e.target.value });
                    }}
                    placeholder="my-project"
                  />
                )}
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="year" required error={p.year.trim() ? null : "Add a year"}>
                  {({ id, describedBy }) => (
                    <input id={id} aria-describedby={describedBy} inputMode="numeric" className={inputClass("font-dmMono")} value={p.year} onChange={(e) => set({ year: e.target.value })} />
                  )}
                </Field>
                <Field label="category" required>
                  {({ id }) => (
                    <select id={id} className={inputClass("font-dmMono text-xs")} value={p.category} onChange={(e) => set({ category: e.target.value as Project["category"] })}>
                      {PROJECT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
              <Field label="your role" required hint="For example: Product design and front end development" error={p.role.trim() ? null : "Add your role"}>
                {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className={inputClass()} value={p.role} onChange={(e) => set({ role: e.target.value })} />}
              </Field>
              <Field label="summary" required hint="One or two short paragraphs. The first one is the card blurb." error={p.summary.trim() ? null : "Add a summary"}>
                {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className={`${inputClass()} min-h-[96px] resize-y`} value={p.summary} onChange={(e) => set({ summary: e.target.value })} />}
              </Field>
              <Field label="description" required hint="The longer overview. A blank line starts a new paragraph." error={p.description.trim() ? null : "Add a description"}>
                {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className={`${inputClass()} min-h-[160px] resize-y`} value={p.description} onChange={(e) => set({ description: e.target.value })} />}
              </Field>
            </>
          )}

          {section === "story" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-adminAccent/25 bg-adminAccent/5 p-3">
                <p className="max-w-[28ch] text-xs leading-relaxed text-zinc-300">Draft all four sections from your basics, then edit them.</p>
                <button
                  type="button"
                  onClick={ai.run}
                  disabled={ai.generating}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-adminAccent/40 bg-adminAccent/15 px-3 py-2 text-[10px] font-dmMono uppercase tracking-[0.14em] text-adminAccent hover:bg-adminAccent/25 disabled:cursor-wait disabled:opacity-60"
                >
                  {ai.generating && <Spinner className="h-3 w-3" />}
                  {ai.generating ? "drafting…" : "✦ draft with ai"}
                </button>
              </div>
              {ai.error && <p role="alert" className="text-xs text-red-300">{ai.error}</p>}
              <Field label="the problem" hint="What was wrong, and for whom?">
                {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className={`${inputClass()} min-h-[110px] resize-y`} value={p.problem ?? ""} onChange={(e) => set({ problem: e.target.value || undefined })} />}
              </Field>
              <Field label="process" hint="How you got there. Research, ideas, what changed along the way.">
                {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className={`${inputClass()} min-h-[140px] resize-y`} value={p.process ?? ""} onChange={(e) => set({ process: e.target.value || undefined })} />}
              </Field>
              <Field label="key decisions" hint="One per line. Write the decision, then why you made it.">
                {({ id, describedBy }) => (
                  <textarea
                    id={id}
                    aria-describedby={describedBy}
                    className={`${inputClass()} min-h-[140px] resize-y`}
                    value={(p.keyDecisions ?? []).join("\n")}
                    onChange={(e) => {
                      const d = e.target.value.split("\n").map((x) => x.trim()).filter(Boolean);
                      set({ keyDecisions: d.length ? d : undefined });
                    }}
                  />
                )}
              </Field>
              <Field label="outcome" hint="What happened. Real results only.">
                {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className={`${inputClass()} min-h-[100px] resize-y`} value={p.outcome ?? ""} onChange={(e) => set({ outcome: e.target.value || undefined })} />}
              </Field>
            </>
          )}

          {section === "media" && (
            <>
              {upload.error && (
                <div role="alert" className="rounded-lg border border-red-400/30 bg-red-400/5 p-3 text-xs leading-relaxed text-zinc-200">
                  <p className="mb-1 text-[10px] font-dmMono uppercase tracking-[0.14em] text-red-300">upload blocked</p>
                  {upload.error}
                  <button type="button" onClick={upload.clearError} className="mt-2 block text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-300 underline underline-offset-4">dismiss</button>
                </div>
              )}
              {(p.snapshots ?? []).length === 0 && (
                <p className="rounded-lg border border-dashed border-white/15 p-6 text-center text-xs text-zinc-400">No images yet. Add one below.</p>
              )}
              <ul className="space-y-4">
                {(p.snapshots ?? []).map((s, i) => (
                  <li key={i} className="space-y-3 rounded-xl border border-white/10 bg-zinc-900/40 p-3">
                    <div className="flex gap-3">
                      <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950 text-[10px] text-zinc-500">
                        {s.src ? <img src={s.src} alt={s.alt || ""} className="h-full w-full object-cover object-top" /> : "no image"}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="text-[10px] font-dmMono uppercase tracking-[0.16em] text-zinc-300">
                          image {i + 1}{i === 0 && <span className="ml-2 text-adminAccent">card cover</span>}
                        </p>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-200 focus-within:ring-2 focus-within:ring-white/60 hover:bg-white/5">
                          {upload.uploadingIndex === i ? "uploading…" : s.src ? "replace file" : "upload file"}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            disabled={upload.uploadingIndex === i}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) upload.start(i, f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {upload.uploadingIndex === i && <Spinner className="ml-2 inline h-3 w-3" />}
                        <p className="text-[11px] text-zinc-400">Under 2.5MB.</p>
                      </div>
                    </div>
                    <Field label="image url" hint="Filled in by the upload, or paste a public link.">
                      {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className={inputClass("font-dmMono text-xs")} value={s.src} onChange={(e) => upload.update(i, { src: e.target.value })} placeholder="https://" />}
                    </Field>
                    <Field label="alt text" hint="Describe the image for people who can't see it." error={s.src && !s.alt.trim() ? "Add alt text" : null}>
                      {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className={inputClass("text-sm")} value={s.alt} onChange={(e) => upload.update(i, { alt: e.target.value })} />}
                    </Field>
                    <button type="button" onClick={() => upload.remove(i)} className="text-[10px] font-dmMono uppercase tracking-[0.14em] text-red-300 hover:text-red-200">remove image</button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={upload.add} className="w-full rounded-lg border border-dashed border-white/20 py-3 text-[10px] font-dmMono uppercase tracking-[0.18em] text-zinc-200 hover:bg-white/5">
                + add image
              </button>
            </>
          )}

          {section === "details" && (
            <>
              <fieldset className="space-y-3">
                <legend className="mb-1 text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-300">project link</legend>
                <div className="grid gap-4 sm:grid-cols-[1fr_1.6fr]">
                  <Field label="button text">
                    {({ id }) => (
                      <input id={id} className={inputClass()} placeholder="visit project" value={p.links?.[0]?.label ?? ""} onChange={(e) => set({ links: [{ label: e.target.value, href: p.links?.[0]?.href ?? "" }] })} />
                    )}
                  </Field>
                  <Field label="url">
                    {({ id }) => (
                      <input id={id} type="url" inputMode="url" className={inputClass("font-dmMono text-xs")} placeholder="https://" value={p.links?.[0]?.href ?? ""} onChange={(e) => set({ links: [{ label: p.links?.[0]?.label || "visit project", href: e.target.value }] })} />
                    )}
                  </Field>
                </div>
              </fieldset>
              <TagInput tags={p.tags} onChange={(tags) => set({ tags })} />
              <fieldset className="space-y-4">
                <legend className="mb-1 text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-300">card color</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField label="accent" hint="The dot and glow on the card." value={p.accentColor} onChange={(hex) => set({ accentColor: hex })} />
                  <ColorField label="text on accent" value={p.accentTextColor} onChange={(hex) => set({ accentTextColor: hex })} />
                </div>
                <div
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium"
                  style={{ backgroundColor: normalizeHex6(p.accentColor) ?? "#3F3F46", color: normalizeHex6(p.accentTextColor) ?? "#fff" }}
                >
                  <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: normalizeHex6(p.accentTextColor) ?? "#fff" }} aria-hidden />
                  Preview: {p.title || "your project"}
                </div>
              </fieldset>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
          <button type="button" onClick={onDelete} className="rounded-lg px-2 py-2 text-[10px] font-dmMono uppercase tracking-[0.16em] text-red-300 hover:bg-red-400/10">
            delete project
          </button>
          <div className="flex items-center gap-3">
            <p className="hidden text-[11px] text-zinc-400 sm:block">
              {issues.length ? `${issues.length} to fix before publishing` : "Edits stay in your draft until you publish"}
            </p>
            <button type="button" onClick={onClose} className="rounded-lg bg-adminAccent px-5 py-2.5 text-[10px] font-dmMono font-medium uppercase tracking-[0.2em] text-zinc-950 hover:opacity-90">
              done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
