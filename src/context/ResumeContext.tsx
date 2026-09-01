import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const DEFAULT_RESUME_URL = "/resume.pdf";

type Source = "pending" | "default" | "cms";

type ResumeContextValue = {
  resumeUrl: string;
  loading: boolean;
  source: Source;
  error: string | null;
  refresh: () => Promise<void>;
};

const ResumeContext = createContext<ResumeContextValue | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeUrl, setResumeUrl] = useState(DEFAULT_RESUME_URL);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<Source>("pending");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/projects", { cache: "no-store" });
      const data = (await r.json()) as {
        ok?: boolean;
        resume?: { url?: string; source?: string };
      };
      const resume = data.resume;
      if (data.ok && resume && typeof resume.url === "string" && resume.url.trim()) {
        setResumeUrl(resume.url);
        setSource(resume.source === "cms" ? "cms" : "default");
      } else {
        setResumeUrl(DEFAULT_RESUME_URL);
        setSource("default");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load résumé");
      setResumeUrl(DEFAULT_RESUME_URL);
      setSource("default");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ResumeContext.Provider value={{ resumeUrl, loading, source, error, refresh: load }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) {
    throw new Error("useResume must be used within ResumeProvider");
  }
  return ctx;
}
