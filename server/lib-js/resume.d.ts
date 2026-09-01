export type ResumeMeta = { url: string; updatedAt?: string };

export type ResumeInfo = {
  url: string;
  updatedAt: string | null;
  source: "cms" | "default";
};

export function getResumeInfo(): Promise<ResumeInfo>;
