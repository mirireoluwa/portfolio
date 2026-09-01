import type { Project } from "../types/project";

type ProjectCardProps = {
  project: Project;
  index: number;
  featured?: boolean;
  fillHeight?: boolean;
  onClick?: () => void;
};

function summaryPreview(summary: string): string {
  const line = summary.split("\n\n")[0]?.trim() ?? summary;
  return line.length > 140 ? `${line.slice(0, 137)}…` : line;
}

export function ProjectCard({
  project,
  index,
  featured = false,
  fillHeight = false,
  onClick,
}: ProjectCardProps) {
  const previewImage = project.snapshots?.[0];
  const preview = summaryPreview(project.summary);
  const tags = project.tags.slice(0, 2);

  return (
    <article
      onClick={onClick}
      className={`project-card group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-950/60 backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-white/[0.14] ${
        featured ? "lg:col-span-2 lg:grid lg:grid-cols-2 lg:items-stretch" : ""
      } ${fillHeight ? "h-full" : ""}`}
      style={
        {
          "--project-accent": project.accentColor,
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.12] blur-3xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ backgroundColor: project.accentColor }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Preview */}
      <div
        className={`relative overflow-hidden bg-zinc-900/80 ${
          featured ? "lg:min-h-[280px]" : ""
        } ${fillHeight ? "min-h-0 flex-1" : "aspect-[16/10]"}`}
      >
        {previewImage ? (
          <>
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/10" />
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `linear-gradient(135deg, ${project.accentColor}18 0%, transparent 55%)`,
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${project.accentColor}33, transparent 50%), linear-gradient(160deg, #0c0c12 0%, #050509 100%)`,
            }}
          />
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <span
            className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-dmMono lowercase tracking-[0.1em] backdrop-blur-md"
            style={{
              borderColor: `${project.accentColor}44`,
              backgroundColor: `${project.accentColor}18`,
              color: project.accentTextColor === "#0b1421" ? project.accentColor : project.accentTextColor,
            }}
          >
            {project.category}
          </span>
          <span className="text-[10px] font-dmMono tracking-[0.2em] text-zinc-500">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <p className="absolute bottom-4 left-4 right-14 hidden translate-y-2 text-[12px] leading-relaxed text-zinc-300/90 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block line-clamp-2">
          {preview}
        </p>
      </div>

      {/* Meta */}
      <div
        className={`relative flex flex-col gap-3 border-t border-white/[0.06] p-4 sm:p-5 ${
          featured ? "lg:justify-center lg:border-t-0 lg:border-l lg:px-6 lg:py-8" : ""
        } ${fillHeight ? "flex-shrink-0" : ""}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-dmMono lowercase tracking-[0.12em] text-zinc-500">
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: project.accentColor,
                  boxShadow: `0 0 10px ${project.accentColor}88`,
                }}
              />
              <span>{project.year}</span>
              <span className="text-zinc-700">·</span>
              <span className="truncate">{project.role}</span>
            </div>
            <h3 className="text-xl font-medium lowercase leading-tight tracking-tight text-zinc-50 sm:text-2xl">
              {project.title}
            </h3>
          </div>

          <span
            className="project-card-arrow mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-zinc-400 transition-all duration-300 group-hover:border-transparent group-hover:text-zinc-950"
            style={{ backgroundColor: "transparent" }}
            aria-hidden
          >
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </span>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-dmMono lowercase tracking-[0.06em] text-zinc-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
