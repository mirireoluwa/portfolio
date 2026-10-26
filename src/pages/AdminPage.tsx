import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AdminInsights } from "../components/AdminInsights";
import { ProjectEditorPanel, projectIssues } from "../components/ProjectEditorPanel";
import { excludeThisBrowser } from "../lib/track";
import { Spinner } from "../components/Spinner";
import { getPublicSiteUrl } from "../config/site";
import { useProjects } from "../context/ProjectsContext";
import { useResume } from "../context/ResumeContext";
import { defaultProjects } from "../data/projects";
import type { Project } from "../types/project";

function emptyProject(): Project {
  return {
    slug: "",
    title: "",
    year: String(new Date().getFullYear()),
    category: "Personal Project",
    role: "",
    summary: "",
    description: "",
    tags: [],
    accentColor: "#4CB3FF",
    accentTextColor: "#0b1421",
    snapshots: [],
  };
}

export function AdminPage() {
  const { refresh: refreshPublicProjects } = useProjects();
  const { refresh: refreshPublicResume } = useResume();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminConfigured, setAdminConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [view, setView] = useState<"projects" | "insights">(() =>
    typeof window !== "undefined" && window.location.hash === "#insights" ? "insights" : "projects"
  );
  const [draft, setDraft] = useState<Project[]>([]);
  const [baseline, setBaseline] = useState("[]");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatingCaseStudy, setGeneratingCaseStudy] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [resumeUrl, setResumeUrl] = useState("/resume.pdf");
  const [resumeUpdatedAt, setResumeUpdatedAt] = useState<string | null>(null);
  const [resumeSource, setResumeSource] = useState<"default" | "cms">("default");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeStatus, setResumeStatus] = useState<string | null>(null);

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

  // Keep the owner's own visits out of the analytics
  useEffect(() => {
    if (authenticated) excludeThisBrowser();
  }, [authenticated]);

  const switchView = (v: "projects" | "insights") => {
    setView(v);
    window.history.replaceState(null, "", v === "insights" ? "#insights" : window.location.pathname);
  };

  const loadDraft = useCallback(async () => {
    setLoadError(null);
    try {
      const r = await fetch("/api/projects", { credentials: "include", cache: "no-store" });
      const data = (await r.json()) as { ok?: boolean; projects?: Project[] | null };
      if (data.ok && Array.isArray(data.projects) && data.projects.length > 0) {
        setDraft(structuredClone(data.projects));
        setBaseline(JSON.stringify(data.projects));
      } else {
        setDraft(structuredClone(defaultProjects));
        setBaseline(JSON.stringify(defaultProjects));
      }
      setActiveIndex(null);
    } catch {
      setLoadError("Could not load projects. Is the API running? (Use `vercel dev` locally.)");
      setDraft(structuredClone(defaultProjects));
      setBaseline(JSON.stringify(defaultProjects));
      setActiveIndex(null);
    }
  }, []);

  const loadResume = useCallback(async () => {
    setResumeError(null);
    try {
      const r = await fetch("/api/projects", { credentials: "include", cache: "no-store" });
      const data = (await r.json()) as {
        ok?: boolean;
        resume?: { url?: string; updatedAt?: string | null; source?: "default" | "cms" };
        message?: string;
      };
      if (!r.ok || !data.ok) {
        setResumeError(data.message || "Could not load résumé info.");
        return;
      }
      const resume = data.resume;
      if (resume && typeof resume.url === "string" && resume.url.trim()) {
        setResumeUrl(resume.url);
      }
      setResumeUpdatedAt(resume?.updatedAt ?? null);
      setResumeSource(resume?.source === "cms" ? "cms" : "default");
    } catch {
      setResumeError("Could not load résumé info.");
    }
  }, []);

  useEffect(() => {
    if (authenticated) void loadDraft();
  }, [authenticated, loadDraft]);

  useEffect(() => {
    if (authenticated) void loadResume();
  }, [authenticated, loadResume]);

  useEffect(() => {
    setUploadError(null);
  }, [activeIndex]);

  // Warn before leaving with unpublished edits
  const dirty = JSON.stringify(draft) !== baseline;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
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
    } finally {
      setLoggingIn(false);
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

  const generateCaseStudy = async () => {
    if (activeIndex === null) return;
    const p = draft[activeIndex];
    setGeneratingCaseStudy(true);
    setGenerateError(null);
    try {
      const r = await fetch("/api/admin/generate-case-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: p.title,
          category: p.category,
          role: p.role,
          summary: p.summary,
          description: p.description,
          tags: p.tags,
        }),
      });
      const data = (await r.json()) as {
        ok?: boolean;
        message?: string;
        caseStudy?: { problem: string; process: string; keyDecisions: string[]; outcome: string };
      };
      if (!data.ok || !data.caseStudy) {
        setGenerateError(data.message ?? "Generation failed. Try again.");
        return;
      }
      updateActive({
        problem: data.caseStudy.problem,
        process: data.caseStudy.process,
        keyDecisions: data.caseStudy.keyDecisions,
        outcome: data.caseStudy.outcome,
      });
    } catch {
      setGenerateError("Network error — check your connection and try again.");
    } finally {
      setGeneratingCaseStudy(false);
    }
  };

  const addProject = () => {
    const next = [...draft, emptyProject()];
    setDraft(next);
    setActiveIndex(next.length - 1);
  };

  const removeProject = (index: number) => {
    const name = draft[index]?.title || "this project";
    if (!confirm(`Delete ${name}? It leaves the draft now and the live site when you publish.`)) return;
    setDraft((d) => d.filter((_, i) => i !== index));
    setActiveIndex(null);
  };

  const moveProject = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= draft.length) return;
    setDraft((d) => {
      const next = [...d];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
    setActiveIndex((a) => (a === index ? j : a === j ? index : a));
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

  const uploadResume = async (file: File) => {
    setResumeError(null);
    setResumeStatus(null);
    const maxFileBytes = 2.5 * 1024 * 1024;
    if (file.size > maxFileBytes) {
      setResumeError(
        `This PDF is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Uploads must be under ~2.5MB. Compress the file and try again.`
      );
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setResumeError("Only PDF files are allowed.");
      return;
    }
    setUploadingResume(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const r = await fetch("/api/admin/upload", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "resume", filename: file.name, dataUrl }),
      });
      const text = await r.text();
      let data: { ok?: boolean; url?: string; updatedAt?: string; message?: string } = {};
      try {
        data = text ? (JSON.parse(text) as typeof data) : {};
      } catch {
        setResumeError(
          `Server returned HTTP ${r.status} (not JSON). The PDF may be too large—use a file under ~2.5MB.`
        );
        return;
      }
      if (!r.ok || !data.ok || !data.url) {
        setResumeError(data.message || `Upload failed (HTTP ${r.status}).`);
        return;
      }
      setResumeUrl(data.url);
      setResumeUpdatedAt(data.updatedAt ?? new Date().toISOString());
      setResumeSource("cms");
      setResumeStatus("Résumé updated. The live site will use the new file.");
      await refreshPublicResume();
    } catch {
      setResumeError("Network error or could not read the file. Check your connection and try again.");
    } finally {
      setUploadingResume(false);
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
      setBaseline(JSON.stringify(draft));
      setSaveStatus(`Published ${data.count} project${data.count === 1 ? "" : "s"}. The live site is updated.`);
    } catch {
      setSaveStatus("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = () => {
    if (!confirm("Replace your draft with the default projects from the code? Nothing goes live until you publish.")) return;
    setDraft(structuredClone(defaultProjects));
    setActiveIndex(null);
  };

  if (!sessionChecked) {
    return (
      <div className="pt-10 flex items-center justify-center gap-2.5 text-sm text-zinc-400 font-dmMono">
        <Spinner />
        Checking session…
      </div>
    );
  }

  if (!adminConfigured) {
    return (
      <div className="mx-auto max-w-md pt-10 space-y-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-6 space-y-3">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50 lowercase">not configured</h1>
          <p className="text-sm leading-relaxed text-zinc-300">
            Set <span className="font-dmMono text-zinc-100">ADMIN_PASSWORD</span> in Vercel environment variables,
            redeploy, then return here.
          </p>
        </div>
        <a
          href={getPublicSiteUrl()}
          className="inline-flex text-xs text-zinc-300 underline underline-offset-4 decoration-zinc-500 hover:text-white"
        >
          ← Back home
        </a>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm pt-10">
        <form
          onSubmit={handleLogin}
          className="rounded-xl border border-white/10 bg-zinc-900/40 p-6 space-y-5"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 lowercase">log in</h1>
          <div className="space-y-2">
            <label htmlFor="admin-password" className="block text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-300">
              password
            </label>
            <div className="flex overflow-hidden rounded-lg border border-white/10 bg-zinc-950/80 focus-within:border-white/30">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-zinc-100 focus:outline-none"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 border-l border-white/10 px-4 text-[10px] font-dmMono uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:text-white"
                aria-pressed={showPassword}
              >
                {showPassword ? "hide" : "show"}
              </button>
            </div>
          </div>
          {loginError && (
            <p role="alert" className="text-xs text-red-400 font-dmMono">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loggingIn}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-adminAccent px-4 py-3 text-[10px] font-dmMono font-medium uppercase tracking-[0.2em] text-zinc-950 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {loggingIn && <Spinner />}
            {loggingIn ? "signing in…" : "sign in"}
          </button>
        </form>
      </div>
    );
  }

  const current = activeIndex !== null ? draft[activeIndex] : null;

  const tabBar = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Admin sections" className="flex gap-6 border-b border-white/10 sm:border-0">
        {(["projects", "insights"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => switchView(v)}
            aria-current={view === v ? "page" : undefined}
            className={`-mb-px border-b-2 py-2.5 text-[11px] font-dmMono uppercase tracking-[0.2em] transition-colors ${
              view === v
                ? "border-adminAccent text-zinc-50"
                : "border-transparent text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {v}
          </button>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="self-start rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-300 hover:bg-white/5 sm:self-auto"
      >
        log out
      </button>
    </div>
  );

  if (view === "insights") {
    return (
      <div className="space-y-8 pb-24">
        {tabBar}
        <AdminInsights />
      </div>
    );
  }

  const problems = draft.reduce((n, p) => n + projectIssues(p).length, 0);
  const canPublish = dirty && !saving && draft.length > 0 && problems === 0;

  return (
    <div className="space-y-8 pb-24">
      {tabBar}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold lowercase tracking-tight text-zinc-50">projects</h1>
          <p className="mt-1 text-xs text-zinc-400">
            {draft.length} project{draft.length === 1 ? "" : "s"}. Edit freely, nothing goes live until you publish.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={addProject} className="rounded-lg border border-white/15 px-3 py-2 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-100 hover:bg-white/5">
            + new project
          </button>
          <button
            type="button"
            disabled={!canPublish}
            onClick={() => void saveToCms()}
            className="inline-flex items-center gap-2 rounded-lg bg-adminAccent px-4 py-2 text-[10px] font-dmMono font-medium uppercase tracking-[0.18em] text-zinc-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving && <Spinner />}
            {saving ? "publishing…" : "publish"}
            {dirty && !saving && <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" aria-label="unpublished changes" />}
          </button>
        </div>
      </div>

      <div aria-live="polite" className="min-h-[1rem] text-xs font-dmMono">
        {saveStatus ? (
          <p className="text-zinc-200">{saveStatus}</p>
        ) : problems > 0 ? (
          <p className="text-red-300">Fix {problems} thing{problems === 1 ? "" : "s"} before you can publish. Open a project to see what's missing.</p>
        ) : dirty ? (
          <p className="text-zinc-300">You have unpublished changes.</p>
        ) : null}
      </div>
      {loadError && <p role="alert" className="text-xs text-red-300 font-dmMono">{loadError}</p>}

      <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40">
        {draft.map((p, i) => {
          const issues = projectIssues(p).length;
          const cover = p.snapshots?.find((s) => s.src)?.src;
          return (
            <li key={`${p.slug}-${i}`} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left sm:gap-4"
                aria-label={`Edit ${p.title || "untitled project"}`}
              >
                <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950 sm:h-16 sm:w-24">
                  {cover ? <img src={cover} alt="" className="h-full w-full object-cover object-top" /> : <span className="text-[10px] text-zinc-500">no image</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: p.accentColor }} aria-hidden />
                    <span className="truncate text-base font-semibold lowercase text-zinc-50">{p.title || "untitled"}</span>
                  </span>
                  <span className="mt-1 block truncate text-[11px] font-dmMono text-zinc-400">
                    {p.category} · {p.year} · /{p.slug || "no-slug"}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300">{t}</span>
                    ))}
                    {issues > 0 && <span className="rounded bg-red-400/15 px-1.5 py-0.5 text-[10px] text-red-300">{issues} to fix</span>}
                  </span>
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => moveProject(i, -1)} disabled={i === 0} aria-label={`Move ${p.title || "project"} up`} className="h-9 w-9 rounded-lg text-zinc-300 hover:bg-white/5 disabled:opacity-25">↑</button>
                <button type="button" onClick={() => moveProject(i, 1)} disabled={i === draft.length - 1} aria-label={`Move ${p.title || "project"} down`} className="h-9 w-9 rounded-lg text-zinc-300 hover:bg-white/5 disabled:opacity-25">↓</button>
                <button type="button" onClick={() => setActiveIndex(i)} className="ml-1 hidden rounded-lg border border-white/15 px-3 py-2 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-100 hover:bg-white/5 sm:inline-block">edit</button>
              </div>
            </li>
          );
        })}
        {draft.length === 0 && <li className="p-8 text-center text-sm text-zinc-400">No projects yet. Add your first one.</li>}
      </ul>

      <section className="rounded-xl border border-white/10 bg-zinc-900/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-300">résumé</h2>
            <p className="mt-2 text-xs text-zinc-400">
              {resumeSource === "cms" ? "Custom file is live" : "Using the default file"}
              {resumeUpdatedAt && ` · updated ${new Date(resumeUpdatedAt).toLocaleDateString()}`}. Uploading replaces it on the site straight away.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-300 underline underline-offset-4 hover:text-white">view ↗</a>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-100 focus-within:ring-2 focus-within:ring-white/60 hover:bg-white/5">
              {uploadingResume ? "uploading…" : "replace pdf"}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                disabled={uploadingResume}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadResume(f);
                  e.target.value = "";
                }}
              />
            </label>
            {uploadingResume && <Spinner />}
          </div>
        </div>
        <div aria-live="polite">
          {resumeError && <p role="alert" className="mt-3 text-xs text-red-300 font-dmMono whitespace-pre-wrap">{resumeError}</p>}
          {resumeStatus && <p className="mt-3 text-xs text-emerald-300 font-dmMono">{resumeStatus}</p>}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-400">
        <button type="button" onClick={() => void loadDraft()} className="hover:text-zinc-100">discard changes</button>
        <button type="button" onClick={restoreDefaults} className="hover:text-zinc-100">restore defaults</button>
        <a href={getPublicSiteUrl()} className="ml-auto hover:text-zinc-100">view portfolio ↗</a>
      </div>

      {current && activeIndex !== null && (
        <ProjectEditorPanel
          project={current}
          index={activeIndex}
          total={draft.length}
          onChange={updateActive}
          onClose={() => setActiveIndex(null)}
          onDelete={() => removeProject(activeIndex)}
          onStep={(dir) => setActiveIndex((a) => (a === null ? a : Math.min(draft.length - 1, Math.max(0, a + dir))))}
          upload={{
            uploadingIndex,
            error: uploadError,
            clearError: () => setUploadError(null),
            start: (i, f) => void uploadSnapshot(i, f),
            add: addSnapshot,
            update: updateSnapshot,
            remove: removeSnapshot,
          }}
          ai={{ generating: generatingCaseStudy, error: generateError, run: () => void generateCaseStudy() }}
        />
      )}
    </div>
  );
}
