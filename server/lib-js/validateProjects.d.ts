export type ValidatedProject = {
  slug: string;
  title: string;
  year: string;
  category: string;
  role: string;
  summary: string;
  description: string;
  problem?: string;
  process?: string;
  keyDecisions?: string[];
  outcome?: string;
  links?: { label: string; href: string }[];
  tags: string[];
  accentColor: string;
  accentTextColor: string;
  snapshots?: { src: string; alt: string }[];
};

export function validateProjectsPayload(body: unknown): {
  ok: true;
  projects: ValidatedProject[];
} | {
  ok: false;
  message: string;
};
