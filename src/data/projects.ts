export type ProjectCategory = "Personal Project" | "Branding and Identity" | "UI/UX";

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
};

export const projects: Project[] = [
  {
    slug: "airflow",
    title: "airflow",
    year: "2025",
    category: "react + tailwind",
    role: "front-end development + design",
    summary: "A web-based task and project management application that helps users plan, organize, and track work efficiently in one streamlined workspace.",
    description:
      "A web app for managing tasks and projects efficiently in one workspace. " +
      "It supports task scheduling, prioritization, and status updates to improve productivity and focus. " +
      "The application is deployed online for fast, reliable access and seamless project management workflows. ",
    links: [
      {
        label: "visit Airflow",
        href: "https://airflow-rust.vercel.app",
      },
    ],
    tags: ["ui/ux design", "front-end development"],
    accentColor: "#FF4949",
    accentTextColor: "#FFFFFF",
  },
  {
    slug: "chowdie",
    title: "chowdie",
    year: "2025",
    category: "Figma",
    role: "UI design, Prototyping",
    summary: "A high‑fidelity Figma prototype that showcases the interactive UI/UX design and user flows for a mobile food‑related application experience.",
    description:
      "A Figma prototype showcasing a mobile food app’s UI and user flows. " +
      "It highlights intuitive navigation, visual layout, and user journey elements created with Figma’s prototyping tools." +
      "The design prototype is shareable via the web, enabling stakeholders to preview and test user flows before development begins. ",
    tags: ["branding", "identity", "design systems"],
    links: [
      {
        label: "visit Chowdie",
        href: "https://www.figma.com/proto/lH04nyFikRTKjGHcRXFAOo/Chowdie?page-id=0%3A1&node-id=1-666&viewport=222%2C200%2C0.2&t=PUg0xBvLlJYwiJVA-1&scaling=min-zoom&content-scaling=fixed",
      },
    ],
    accentColor: "#FFA100",
    accentTextColor: "#000000",
  },
  {
    slug: "saintted",
    title: "saintted",
    year: "2025",
    category: "Framer",
    role: "Design, Development",
    summary: "A personal music and artist portfolio site showcasing Saintted’s music and creative identity.",
    description:
      "This site highlights Saintted as an Ableton‑based producer and musical artist from Lagos, Nigeria. " +
      "It features links to his latest tracks, music platforms, and social profiles for easy listening and engagement." +
      "The design provides a clean, immersive digital presence to showcase his creative work and connect with fans. ",
    tags: ["mobile", "ui/ux", "web development"],
    links: [
      {
        label: "visit saintted",
        href: "https://saintted.framer.website",
      },
    ],
    accentColor: "#2E3538",
    accentTextColor: "#B3FFCB",
  },
];


