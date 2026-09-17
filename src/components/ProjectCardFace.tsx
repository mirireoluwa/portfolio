import type { Project } from "../types/project";

/**
 * The shared "face" of a project — image, scrim, category/title/tags — used
 * both by the desktop preview panel (ProjectShowcase) and the mobile swipe
 * stack, so the two breakpoints read as the same card system instead of two
 * different designs that happen to share data.
 */
export function ProjectCardFace({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  const img = project.snapshots?.[0];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {img ? (
        <img
          src={img.src}
          alt={img.alt}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: project.accentColor, opacity: 0.15 }}
        />
      )}

      {/* Scrim — inline gradient (not Tailwind's gradient-stop utilities,
          which don't compose reliably with several custom stops) so the text
          below stays legible over bright screenshots regardless of image,
          without reading as a flat, overly dark bar. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.78) 26%, rgba(9,9,11,0.5) 48%, rgba(9,9,11,0.12) 72%, transparent 90%)",
        }}
      />

      {/* Corner affordance */}
      <span className="absolute right-4 top-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-zinc-950/60 text-zinc-300 backdrop-blur-sm">
        →
      </span>

      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col items-start ${
          compact ? "p-5" : "p-7"
        }`}
      >
        <span className="mb-2.5 inline-flex items-center gap-1.5 font-dmMono text-[10px] uppercase tracking-[0.14em] text-zinc-300">
          <span
            className="h-1.5 w-1.5 flex-shrink-0 rounded-sm"
            style={{ backgroundColor: project.accentColor }}
          />
          {project.category}
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">{project.year}</span>
        </span>

        <h3
          className={`mb-2 font-semibold lowercase text-zinc-50 ${
            compact ? "text-2xl" : "text-3xl"
          }`}
        >
          {project.title}
        </h3>

        {!compact && (
          <p className="mb-4 max-w-md text-sm leading-relaxed text-zinc-400">
            {project.summary.split("\n\n")[0]}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {!compact && (
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-100">
            view case study
            <span aria-hidden>→</span>
          </span>
        )}
      </div>
    </div>
  );
}
