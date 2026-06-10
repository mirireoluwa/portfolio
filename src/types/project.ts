export type ProjectCategory =
  | "Personal Project"
  | "Product Design"
  | "UX/Product Design"
  | "Brand + Web Design"
  | "Branding and Identity"
  | "UI/UX"
  | "react + tailwind"
  | "Figma"
  | "Framer";

export type Project = {
  slug: string;
  title: string;
  year: string;
  category: ProjectCategory;
  role: string;
  summary: string;
  description: string;
  /** The user or business problem this project was solving */
  problem?: string;
  /** The design process — research, ideation, decisions */
  process?: string;
  /** Specific design decisions made and why */
  keyDecisions?: string[];
  /** Measurable or qualitative outcome */
  outcome?: string;
  links?: { label: string; href: string }[];
  tags: string[];
  accentColor: string;
  accentTextColor: string;
  snapshots?: { src: string; alt: string }[];
};

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Personal Project",
  "Product Design",
  "UX/Product Design",
  "Brand + Web Design",
  "Branding and Identity",
  "UI/UX",
  "react + tailwind",
  "Figma",
  "Framer",
];
