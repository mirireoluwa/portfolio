export type ProjectCategory =
  | "Personal Project"
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
  links?: { label: string; href: string }[];
  tags: string[];
  accentColor: string;
  accentTextColor: string;
  snapshots?: { src: string; alt: string }[];
};

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Personal Project",
  "Branding and Identity",
  "UI/UX",
  "react + tailwind",
  "Figma",
  "Framer",
];
