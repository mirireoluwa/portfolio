import type { SiteContent } from "../types/site";

/** Bundled fallback — used until the CMS (Redis) has saved site content. */
export const defaultSite: SiteContent = {
  hero: { roles: ["a product designer", "a sound designer"] },
  about: {
    photoUrl: "/about-photo-new.jpg",
    photoAlt: "Portrait of Mirireoluwa",
    body:
      "I'm a product designer who works at the intersection of user insight, visual craft, and product thinking. I focus on building experiences that are clear, considered, and actually useful. My background in Computer Science means I think about feasibility and implementation alongside aesthetics, which makes collaboration with engineering teams more direct. I also produce music as [Saintted](https://saintted.com), where I explore similar questions of form, emotion, and clarity—just through sound.",
    chips: [
      { label: "available for work", live: true },
      { label: "CS student" },
      { label: "Lagos, NG" },
    ],
  },
  experience: [
    {
      id: "airtel",
      title: "Product Design & IT Intern",
      company: "Airtel Nigeria",
      period: "2025",
      accentColor: "#FF4949",
      bullets: [
        "Designed and developed a project & task management application with features for projects, tasks, checklists, and dependencies, enabling potential use across multiple Airtel Nigeria departments.",
        "Contributed to the design and implementation of a new USSD service, improving connectivity and user experience for millions of daily users.",
        "Assisted in troubleshooting USSD service issues, improving service reliability and customer experience.",
        "Built a Python application that organizes raw data dumps into structured files, improving data readability and accessibility across teams.",
      ],
    },
    {
      id: "product-studio",
      title: "UI/UX Design & Frontend Intern",
      company: "Product Studio HQ",
      period: "2024",
      accentColor: "#FFFFFF",
      bullets: [
        "Designed intuitive user interfaces for a non-profit organization's website, enhancing its online presence and user engagement through Figma prototypes.",
        "Conceptualized and created UI designs and interactive prototypes in Figma for a wealth management application tailored to high-net-worth individuals.",
        "Developed and deployed responsive websites using React, TypeScript, and Tailwind CSS via Vercel, bridging design handoff and implementation.",
      ],
    },
    {
      id: "city-church",
      title: "Media & Creative Intern",
      company: "City Church Lagos",
      period: "2023",
      accentColor: "#65DB61",
      bullets: [
        "Designed promotional graphics and visual content for the organization's social media platforms using Adobe Illustrator, maintaining brand consistency across all materials.",
        "Shot and edited photography for events and services, producing polished visual assets for print and digital use.",
        "Edited video content for recaps, highlights, and promotional materials distributed across social channels.",
        "Provided creative direction for media productions, coordinating visual style and ensuring cohesive storytelling across formats.",
        "Managed live streaming operations for services and events, overseeing technical setup and real-time broadcast quality.",
      ],
    },
  ],
};
