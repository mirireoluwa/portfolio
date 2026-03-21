const CATEGORIES = new Set([
  "Personal Project",
  "Branding and Identity",
  "UI/UX",
  "react + tailwind",
  "Figma",
  "Framer",
]);

export type ValidatedProject = {
  slug: string;
  title: string;
  year: string;
  category: string;
  role: string;
  summary: string;
  description: string;
  links?: { label: string; href: string }[];
  tags: string[];
  accentColor: string;
  accentTextColor: string;
  snapshots?: { src: string; alt: string }[];
};

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateProjectsPayload(
  body: unknown
): { ok: true; projects: ValidatedProject[] } | { ok: false; message: string } {
  if (!body || typeof body !== "object") return { ok: false, message: "Invalid body" };
  const arr = (body as { projects?: unknown }).projects;
  if (!Array.isArray(arr)) return { ok: false, message: "projects must be an array" };
  if (arr.length === 0) return { ok: false, message: "Add at least one project" };
  if (arr.length > 50) return { ok: false, message: "Too many projects (max 50)" };

  const slugs = new Set<string>();
  const out: ValidatedProject[] = [];

  for (let i = 0; i < arr.length; i++) {
    const p = arr[i];
    if (!p || typeof p !== "object") return { ok: false, message: `Invalid project at row ${i + 1}` };
    const o = p as Record<string, unknown>;

    const slug = normalizeSlug(typeof o.slug === "string" ? o.slug : "");
    if (!slug) return { ok: false, message: `Row ${i + 1}: slug is required (letters, numbers, hyphens)` };
    if (slugs.has(slug)) return { ok: false, message: `Duplicate slug: ${slug}` };
    slugs.add(slug);

    if (typeof o.title !== "string" || !o.title.trim()) {
      return { ok: false, message: `Row ${i + 1}: title is required` };
    }
    if (typeof o.year !== "string" || !o.year.trim()) {
      return { ok: false, message: `Row ${i + 1}: year is required` };
    }
    if (typeof o.category !== "string" || !CATEGORIES.has(o.category)) {
      return { ok: false, message: `Row ${i + 1}: invalid category` };
    }
    if (typeof o.role !== "string" || !o.role.trim()) {
      return { ok: false, message: `Row ${i + 1}: role is required` };
    }
    if (typeof o.summary !== "string" || !o.summary.trim()) {
      return { ok: false, message: `Row ${i + 1}: summary is required` };
    }
    if (typeof o.description !== "string" || !o.description.trim()) {
      return { ok: false, message: `Row ${i + 1}: description is required` };
    }
    if (typeof o.accentColor !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(o.accentColor.trim())) {
      return { ok: false, message: `Row ${i + 1}: accent color must be #RRGGBB` };
    }
    if (typeof o.accentTextColor !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(o.accentTextColor.trim())) {
      return { ok: false, message: `Row ${i + 1}: text color must be #RRGGBB` };
    }

    let tags: string[] = [];
    if (Array.isArray(o.tags)) {
      tags = o.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0).map((t) => t.trim());
    } else if (typeof o.tags === "string") {
      tags = o.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (tags.length === 0) return { ok: false, message: `Row ${i + 1}: add at least one tag` };

    let links: { label: string; href: string }[] | undefined;
    if (o.links !== undefined) {
      if (!Array.isArray(o.links)) return { ok: false, message: `Row ${i + 1}: links must be an array` };
      links = [];
      for (const link of o.links) {
        if (!link || typeof link !== "object") continue;
        const L = link as Record<string, unknown>;
        if (typeof L.label === "string" && L.label.trim() && typeof L.href === "string" && L.href.trim()) {
          links.push({ label: L.label.trim(), href: L.href.trim() });
        }
      }
      if (links.length === 0) links = undefined;
    }

    let snapshots: { src: string; alt: string }[] | undefined;
    if (o.snapshots !== undefined) {
      if (!Array.isArray(o.snapshots)) return { ok: false, message: `Row ${i + 1}: snapshots must be an array` };
      snapshots = [];
      for (const s of o.snapshots) {
        if (!s || typeof s !== "object") continue;
        const S = s as Record<string, unknown>;
        if (typeof S.src === "string" && S.src.trim() && typeof S.alt === "string") {
          snapshots.push({ src: S.src.trim(), alt: S.alt.trim() || "Project snapshot" });
        }
      }
      if (snapshots.length === 0) snapshots = undefined;
    }

    out.push({
      slug,
      title: (o.title as string).trim(),
      year: (o.year as string).trim(),
      category: o.category as string,
      role: (o.role as string).trim(),
      summary: (o.summary as string).trim(),
      description: (o.description as string).trim(),
      links,
      tags,
      accentColor: o.accentColor.trim(),
      accentTextColor: o.accentTextColor.trim(),
      snapshots,
    });
  }

  return { ok: true, projects: out };
}
