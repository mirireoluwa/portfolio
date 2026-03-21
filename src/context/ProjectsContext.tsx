import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { defaultProjects } from "../data/projects";
import type { Project } from "../types/project";

type Source = "pending" | "default" | "cms";

type ProjectsContextValue = {
  projects: Project[];
  loading: boolean;
  source: Source;
  error: string | null;
  refresh: () => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
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
        source?: string;
        projects?: Project[] | null;
      };
      if (data.ok && Array.isArray(data.projects) && data.projects.length > 0) {
        setProjects(data.projects);
        setSource("cms");
      } else {
        setProjects(defaultProjects);
        setSource("default");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
      setProjects(defaultProjects);
      setSource("default");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ProjectsContext.Provider value={{ projects, loading, source, error, refresh: load }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error("useProjects must be used within ProjectsProvider");
  }
  return ctx;
}
