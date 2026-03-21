import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getPublicSiteUrl } from "../config/site";
import { useProjects } from "../context/ProjectsContext";
import { defaultProjects } from "../data/projects";
import type { Project } from "../types/project";
import { PROJECT_CATEGORIES } from "../types/project";

function emptyProject(): Project {
  return {
    slug: "",
    title: "",
    year: String(new Date().getFullYear()),
    category: "Personal Project",
    role: "",
    summary: "",
    description: "",
    tags: ["ui/ux"],
    accentColor: "#4CB3FF",
    accentTextColor: "#0b1421",
    links: [{ label: "visit project", href: "https://" }],
    snapshots: [],
  };
}

function inputClass(extra = "") {
  return `w-full rounded-apple-sm border border-white/10 bg-surface/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/25 ${extra}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      {children}
    </div>
  );
}

/** Returns #rrggbb or null if not exactly 6 hex digits (with optional #). */
function normalizeHex6(raw: string): string | null {
  const t = raw.trim();
  const m = t.match(/^#?([0-9A-Fa-f]{6})$/);
  return m ? `#${m[1].toUpperCase()}` : null;
}

function ColorHexField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const normalized = normalizeHex6(value);
  const pickerValue = normalized ?? "#3F3F46";

  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="admin-color-swatch shrink-0"
          title={
            normalized
              ? `${normalized} — click to change`
              : "Invalid hex — click to pick a color, or type #RRGGBB"
          }
          aria-label={`${label} — color preview and picker`}
        />
        <input
          type="text"
          inputMode="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass("font-dmMono flex-1 min-w-0")}
          placeholder="#RRGGBB"
          spellCheck={false}
          autoComplete="off"
          aria-label={`${label} — hex value`}
        />
      </div>
    </Field>
  );
}

function IconEye() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        d="M10.7 10.7a3 3 0 0 0 4.2 4.2M9.88 5.09A10.4 10.4 0 0 1 12 5c6 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-2.72 2.72A10.4 10.4 0 0 1 12 19c-6 0-10-7-10-7a18.5 18.5 0 0 1 4.07-5.69"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 2 22 22" strokeLinecap="round" />
    </svg>
  );
}

export function AdminPage() {
  const { refresh: refreshPublicProjects } = useProjects();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminConfigured, setAdminConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [draft, setDraft] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/session", { credentials: "include" });
      const data = (await r.json()) as { ok?: boolean; configured?: boolean };
      if (data.configured === false) {
        setAdminConfigured(false);
        setAuthenticated(false);
      } else {
        setAdminConfigured(true);
        setAuthenticated(!!data.ok);
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const loadDraft = useCallback(async () => {
    setLoadError(null);
    try {
      const r = await fetch("/api/projects", { credentials: "include", cache: "no-store" });
      const data = (await r.json()) as { ok?: boolean; projects?: Project[] | null };
      if (data.ok && Array.isArray(data.projects) && data.projects.length > 0) {
        setDraft(structuredClone(data.projects));
      } else {
        setDraft(structuredClone(defaultProjects));
      }
      setActiveIndex(0);
    } catch {
      setLoadError("Could not load projects. Is the API running? (Use `vercel dev` locally.)");
      setDraft(structuredClone(defaultProjects));
      setActiveIndex(0);
    }
  }, []);

  useEffect(() => {
    if (authenticated) void loadDraft();
  }, [authenticated, loadDraft]);

  useEffect(() => {
    setUploadError(null);
  }, [activeIndex]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = (await r.json()) as { ok?: boolean; message?: string };
      if (!r.ok || !data.ok) {
        setLoginError(data.message || "Login failed");
        return;
      }
      setAuthenticated(true);
      setPassword("");
    } catch {
      setLoginError("Network error");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthenticated(false);
    setDraft([]);
    setActiveIndex(null);
    void checkSession();
  };

  const updateActive = (patch: Partial<Project>) => {
    if (activeIndex === null) return;
    setDraft((d) => {
      const next = [...d];
      next[activeIndex] = { ...next[activeIndex], ...patch };
      return next;
    });
  };

  const updateTagsString = (s: string) => {
    const tags = s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    updateActive({ tags });
  };

  const addProject = () => {
    const next = [...draft, emptyProject()];
    setDraft(next);
    setActiveIndex(next.length - 1);
  };

  const removeProject = (index: number) => {
    if (!confirm("Remove this project from the draft?")) return;
    const next = draft.filter((_, i) => i !== index);
    let newActive = activeIndex;
    if (activeIndex === null) newActive = next.length ? 0 : null;
    else if (activeIndex === index) newActive = next.length ? Math.min(index, next.length - 1) : null;
    else if (activeIndex > index) newActive = activeIndex - 1;
    setDraft(next);
    setActiveIndex(newActive);
  };

  const moveProject = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= draft.length) return;
    setDraft((d) => {
      const next = [...d];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
    setActiveIndex(j);
  };

  const addSnapshot = () => {
    if (activeIndex === null) return;
    const p = draft[activeIndex];
    const snaps = [...(p.snapshots || []), { src: "", alt: "" }];
    updateActive({ snapshots: snaps });
  };

  const updateSnapshot = (si: number, patch: { src?: string; alt?: string }) => {
    if (activeIndex === null) return;
    const p = draft[activeIndex];
    const snaps = [...(p.snapshots || [])];
    snaps[si] = { ...snaps[si], ...patch };
    updateActive({ snapshots: snaps });
  };

  const removeSnapshot = (si: number) => {
    if (activeIndex === null) return;
    const p = draft[activeIndex];
    const snaps = (p.snapshots || []).filter((_, i) => i !== si);
    updateActive({ snapshots: snaps.length ? snaps : undefined });
  };

  const uploadSnapshot = async (snapshotIndex: number, file: File) => {
    if (activeIndex === null) return;
    setUploadError(null);
    // Base64 JSON is ~33% larger; Vercel request body limit ~4.5MB — stay safe under ~2.5MB file
    const maxFileBytes = 2.5 * 1024 * 1024;
    if (file.size > maxFileBytes) {
      setUploadError(
        `This file is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Uploads must be under ~2.5MB (encoding pushes the request over Vercel’s limit). Compress the image or paste an HTTPS URL.`
      );
      return;
    }
    setUploadingIndex(snapshotIndex);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const r = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ filename: file.name, dataUrl }),
      });
      const text = await r.text();
      let data: { ok?: boolean; url?: string; message?: string } = {};
      try {
        data = text ? (JSON.parse(text) as typeof data) : {};
      } catch {
        setUploadError(
          `Server returned HTTP ${r.status} (not JSON). Often the request is too large—use a smaller image (~2MB) or paste a URL.`
        );
        return;
      }
      if (!r.ok || !data.ok || !data.url) {
        setUploadError(data.message || `Upload failed (HTTP ${r.status}).`);
        return;
      }
      updateSnapshot(snapshotIndex, { src: data.url });
    } catch {
      setUploadError("Network error or could not read the file. Check your connection and try again.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const saveToCms = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const r = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projects: draft }),
      });
      const data = (await r.json()) as { ok?: boolean; message?: string; count?: number };
      if (!r.ok || !data.ok) {
        setSaveStatus(data.message || "Save failed");
        return;
      }
      await refreshPublicProjects();
      setSaveStatus(`Saved ${data.count} project(s). The portfolio view is updated.`);
    } catch {
      setSaveStatus("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = () => {
    if (!confirm("Replace the draft with bundled default projects from the repo?")) return;
    setDraft(structuredClone(defaultProjects));
    setActiveIndex(0);
  };

  if (!sessionChecked) {
    return (
      <div className="pt-10 flex items-center justify-center text-sm text-zinc-400 font-dmMono">
        Checking session…
      </div>
    );
  }

  if (!adminConfigured) {
    return (
      <div className="pt-10 space-y-4 max-w-lg">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <p>.admin</p>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>
        <p className="text-sm text-zinc-300">
          Admin is not configured. Set <span className="font-dmMono text-zinc-200">ADMIN_PASSWORD</span> in
          Vercel environment variables, redeploy, then return here.
        </p>
        <a
          href={getPublicSiteUrl()}
          className="inline-flex text-xs text-zinc-400 underline underline-offset-4 decoration-zinc-600 hover:text-zinc-200"
        >
          ← Back home
        </a>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="pt-2 space-y-8 max-w-md mx-auto">
        <div className="rounded-apple-lg border border-white/10 bg-surface/80 p-6 shadow-soft space-y-4">
          <h1 className="text-xl font-semibold text-zinc-50 lowercase">portfolio cms</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Sign in to edit projects stored in Upstash Redis. The public site reads the same data after you save.
          </p>
          <form onSubmit={handleLogin} className="space-y-3">
            <Field label="password">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass()}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </Field>
            {loginError && <p className="text-xs text-red-400 font-dmMono">{loginError}</p>}
            <div className="flex gap-2 items-stretch">
              <button
                type="submit"
                className="flex-1 min-w-0 rounded-apple-sm border border-white/70 bg-white px-4 py-2.5 text-[10px] font-dmMono uppercase tracking-[0.16em] text-zinc-950 hover:bg-white/90 transition-colors"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 w-12 inline-flex items-center justify-center rounded-apple-sm border border-white/15 bg-surface/90 text-zinc-400 hover:text-zinc-100 hover:border-white/25 hover:bg-white/5 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </form>
        </div>
        <a
          href={getPublicSiteUrl()}
          className="inline-flex text-xs text-zinc-400 underline underline-offset-4 decoration-zinc-600 hover:text-zinc-200"
        >
          ← Back home
        </a>
      </div>
    );
  }

  const current = activeIndex !== null ? draft[activeIndex] : null;

  return (
    <div className="pt-4 space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <p>.admin</p>
          <div className="flex-1 h-px bg-zinc-800 sm:hidden" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadDraft()}
            className="rounded-apple-sm border border-white/15 px-3 py-1.5 text-[10px] font-dmMono uppercase tracking-[0.12em] text-zinc-300 hover:bg-white/5"
          >
            Reload draft
          </button>
          <button
            type="button"
            onClick={restoreDefaults}
            className="rounded-apple-sm border border-white/15 px-3 py-1.5 text-[10px] font-dmMono uppercase tracking-[0.12em] text-zinc-300 hover:bg-white/5"
          >
            Restore defaults
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-apple-sm border border-red-500/30 px-3 py-1.5 text-[10px] font-dmMono uppercase tracking-[0.12em] text-red-300 hover:bg-red-500/10"
          >
            Log out
          </button>
        </div>
      </div>

      {loadError && <p className="text-xs text-amber-400 font-dmMono">{loadError}</p>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,280px),minmax(0,1fr)] items-start">
        <aside className="space-y-3 rounded-apple-lg border border-white/10 bg-surface/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-500">projects</p>
            <button
              type="button"
              onClick={addProject}
              className="text-[10px] font-dmMono uppercase tracking-[0.12em] text-zinc-300 hover:text-white"
            >
              + add
            </button>
          </div>
          <ul className="space-y-1">
            {draft.map((p, i) => (
              <li key={`${p.slug}-${i}`}>
                <div
                  className={`flex items-center gap-1 rounded-apple-sm border px-2 py-2 transition-colors ${
                    activeIndex === i
                      ? "border-white/25 bg-zinc-800/60"
                      : "border-transparent bg-zinc-900/40 hover:border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className="flex-1 text-left text-xs text-zinc-200 truncate lowercase font-medium"
                  >
                    {p.title || p.slug || "untitled"}
                  </button>
                  <div className="flex shrink-0 gap-0.5">
                    <button
                      type="button"
                      aria-label="Move up"
                      onClick={() => moveProject(i, -1)}
                      className="px-1 text-zinc-500 hover:text-zinc-200 text-[10px]"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      onClick={() => moveProject(i, 1)}
                      className="px-1 text-zinc-500 hover:text-zinc-200 text-[10px]"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="space-y-6">
          {current ? (
            <div className="rounded-apple-lg border border-white/10 bg-surface/80 p-5 sm:p-6 space-y-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-zinc-50 lowercase">edit project</h2>
                <button
                  type="button"
                  onClick={() => removeProject(activeIndex)}
                  className="text-[10px] font-dmMono uppercase tracking-[0.12em] text-red-400 hover:text-red-300"
                >
                  delete
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="slug (url)">
                  <input
                    className={inputClass("font-dmMono lowercase")}
                    value={current.slug}
                    onChange={(e) => updateActive({ slug: e.target.value })}
                    placeholder="my-project"
                  />
                </Field>
                <Field label="title">
                  <input
                    className={inputClass("lowercase")}
                    value={current.title}
                    onChange={(e) => updateActive({ title: e.target.value })}
                  />
                </Field>
                <Field label="year">
                  <input
                    className={inputClass("font-dmMono")}
                    value={current.year}
                    onChange={(e) => updateActive({ year: e.target.value })}
                  />
                </Field>
                <Field label="category">
                  <select
                    className={inputClass("font-dmMono text-xs")}
                    value={current.category}
                    onChange={(e) =>
                      updateActive({ category: e.target.value as Project["category"] })
                    }
                  >
                    {PROJECT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="role">
                <input
                  className={inputClass()}
                  value={current.role}
                  onChange={(e) => updateActive({ role: e.target.value })}
                />
              </Field>

              <Field label="summary">
                <textarea
                  className={`${inputClass()} min-h-[72px] resize-y`}
                  value={current.summary}
                  onChange={(e) => updateActive({ summary: e.target.value })}
                />
              </Field>

              <Field label="description">
                <textarea
                  className={`${inputClass()} min-h-[120px] resize-y`}
                  value={current.description}
                  onChange={(e) => updateActive({ description: e.target.value })}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <ColorHexField
                  label="card background (#hex)"
                  value={current.accentColor}
                  onChange={(hex) => updateActive({ accentColor: hex })}
                />
                <ColorHexField
                  label="card text (#hex)"
                  value={current.accentTextColor}
                  onChange={(hex) => updateActive({ accentTextColor: hex })}
                />
              </div>

              <Field label="tags (comma-separated)">
                <input
                  className={inputClass("font-dmMono text-xs")}
                  value={current.tags.join(", ")}
                  onChange={(e) => updateTagsString(e.target.value)}
                />
              </Field>

              <div className="space-y-2">
                <p className="text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-500">primary link</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={inputClass("text-xs")}
                    placeholder="Label"
                    value={current.links?.[0]?.label ?? ""}
                    onChange={(e) => {
                      const href = current.links?.[0]?.href ?? "https://";
                      updateActive({ links: [{ label: e.target.value, href }] });
                    }}
                  />
                  <input
                    className={inputClass("font-dmMono text-xs")}
                    placeholder="https://"
                    value={current.links?.[0]?.href ?? ""}
                    onChange={(e) => {
                      const label = current.links?.[0]?.label ?? "visit";
                      updateActive({ links: [{ label, href: e.target.value }] });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-500">snapshots</p>
                  <button
                    type="button"
                    onClick={addSnapshot}
                    className="shrink-0 rounded-apple-sm border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-[10px] font-dmMono font-medium uppercase tracking-[0.14em] text-amber-100 shadow-sm hover:border-amber-400/60 hover:bg-amber-500/25 hover:text-white transition-colors"
                  >
                    + add image
                  </button>
                </div>
                {uploadError && (
                  <div
                    role="alert"
                    className="rounded-apple-sm border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/95 leading-relaxed"
                  >
                    <p className="font-dmMono text-[10px] uppercase tracking-[0.12em] text-amber-400/90 mb-1">
                      Upload blocked
                    </p>
                    <p>{uploadError}</p>
                    {/blob|token|vercel|4\.5|encoding|private|public/i.test(uploadError) && (
                      <p className="mt-2 text-[11px] text-zinc-400">
                        In Vercel: <span className="text-zinc-300">Storage → Blob</span> — the store must allow{" "}
                        <span className="text-zinc-300">public</span> files (private-only stores break CMS uploads).
                        Connect the store, set <span className="font-dmMono text-zinc-300">BLOB_READ_WRITE_TOKEN</span>{" "}
                        for Production, redeploy. Or paste a public HTTPS image URL.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setUploadError(null)}
                      className="mt-2 text-[10px] font-dmMono uppercase tracking-[0.12em] text-amber-300 hover:text-amber-200"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                {(current.snapshots || []).map((snap, si) => (
                  <div
                    key={si}
                    className="flex flex-col gap-2 rounded-apple-sm border border-white/10 p-3 bg-zinc-950/40"
                  >
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="text-[10px] text-zinc-400 file:mr-2 file:rounded-apple-sm file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-zinc-200"
                        disabled={uploadingIndex === si}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadSnapshot(si, f);
                          e.target.value = "";
                        }}
                      />
                      {uploadingIndex === si && (
                        <span className="text-[10px] text-zinc-500 font-dmMono">uploading…</span>
                      )}
                    </div>
                    <input
                      className={inputClass("font-dmMono text-[11px]")}
                      placeholder="Image URL (or upload above)"
                      value={snap.src}
                      onChange={(e) => updateSnapshot(si, { src: e.target.value })}
                    />
                    <input
                      className={inputClass("text-xs")}
                      placeholder="Alt text"
                      value={snap.alt}
                      onChange={(e) => updateSnapshot(si, { alt: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeSnapshot(si)}
                      className="self-start text-[10px] text-red-400 hover:text-red-300 font-dmMono uppercase tracking-[0.12em]"
                    >
                      remove snapshot
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Select a project or add one.</p>
          )}

          <div className="rounded-apple-lg border border-white/15 bg-zinc-900/50 p-5 space-y-3">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Saving writes to <span className="font-dmMono text-zinc-300">Upstash Redis</span>. Add{" "}
              <span className="font-dmMono text-zinc-300">UPSTASH_REDIS_REST_URL</span> and{" "}
              <span className="font-dmMono text-zinc-300">UPSTASH_REDIS_REST_TOKEN</span> in Vercel (or{" "}
              <span className="font-dmMono text-zinc-300">.env.local</span> for <span className="font-dmMono">vercel dev</span>
              ), then redeploy / restart dev. Optional: <span className="font-dmMono text-zinc-300">BLOB_READ_WRITE_TOKEN</span>{" "}
              for image uploads.
            </p>
            <button
              type="button"
              disabled={saving || draft.length === 0}
              onClick={() => void saveToCms()}
              className="rounded-apple-sm border border-white/70 bg-white px-5 py-2.5 text-[10px] font-dmMono uppercase tracking-[0.16em] text-zinc-950 hover:bg-white/90 disabled:opacity-40 transition-colors"
            >
              {saving ? "Saving…" : "Publish to live site"}
            </button>
            {saveStatus && (
              <p className="text-xs text-zinc-300 font-dmMono whitespace-pre-wrap">{saveStatus}</p>
            )}
          </div>

          <a
            href={getPublicSiteUrl()}
            className="inline-flex text-xs text-zinc-400 underline underline-offset-4 decoration-zinc-600 hover:text-zinc-200"
          >
            ← View portfolio
          </a>
        </section>
      </div>
    </div>
  );
}
