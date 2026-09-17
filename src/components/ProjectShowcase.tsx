import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types/project";

/**
 * Desktop project browser ("option B" from the card-redesign comparison) —
 * a title list on the left, a single preview panel on the right that
 * crossfades to whichever project is hovered/focused. Mobile keeps the
 * separate swipeable card stack in HomePage; the two don't share a mechanic
 * on purpose (hover doesn't exist on touch).
 */
export function ProjectShowcase({ projects }: { projects: Project[] }) {
  const navigate = useNavigate();
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug);
  const active = projects.find((p) => p.slug === activeSlug) ?? projects[0];

  if (!active) return null;

  return (
    <div className="hidden lg:grid grid-cols-[300px_1fr] items-start gap-10">
      {/* Title list */}
      <div className="flex flex-col border-t border-white/10">
        {projects.map((project, i) => {
          const isActive = project.slug === activeSlug;
          return (
            <button
              key={project.slug}
              type="button"
              onMouseEnter={() => setActiveSlug(project.slug)}
              onFocus={() => setActiveSlug(project.slug)}
              onClick={() => navigate(`/projects/${project.slug}`)}
              className="group border-b border-white/10 py-5 pr-4 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`font-dmMono text-[11px] tracking-[0.08em] transition-colors duration-200 ${
                    isActive ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-xs transition-all duration-200 ${
                    isActive ? "translate-x-0.5 text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  →
                </span>
              </div>
              <h3
                className={`mt-1 text-3xl font-semibold lowercase tracking-tight transition-colors duration-200 ${
                  isActive ? "text-zinc-50" : "text-zinc-600 group-hover:text-zinc-300"
                }`}
              >
                {project.title}
              </h3>
              <p className="mt-1 font-dmMono text-[10px] uppercase tracking-[0.1em] text-zinc-600">
                {project.category} · {project.year}
              </p>
            </button>
          );
        })}
      </div>

      {/* Preview panel */}
      <div
        className="relative h-[440px] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
        onClick={() => navigate(`/projects/${active.slug}`)}
      >
        {projects.map((project) => {
          const img = project.snapshots?.[0];
          return (
            <div
              key={project.slug}
              className="absolute inset-0 transition-opacity duration-500 ease-out"
              style={{ opacity: project.slug === activeSlug ? 1 : 0 }}
              aria-hidden={project.slug !== activeSlug}
            >
              {img ? (
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: project.accentColor, opacity: 0.15 }}
                />
              )}
            </div>
          );
        })}

        {/* Persistent scrim — independent of which image is showing, so text
            stays legible even over bright screenshots (e.g. chowdie's UI).
            Solid through ~55% up (where the text block sits), then eases
            out so the image still reads clearly near the top. Inline style,
            not Tailwind's gradient-stop utilities — those don't compose
            reliably with three custom stops. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #09090b 0%, #09090b 40%, rgba(9,9,11,0.78) 55%, transparent 92%)",
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={active.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-0 bottom-0 flex flex-col items-start p-7"
          >
            <span className="mb-3 inline-flex items-center gap-1.5 font-dmMono text-[10px] uppercase tracking-[0.14em] text-zinc-300">
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: active.accentColor }}
              />
              {active.category}
            </span>
            <h3 className="mb-2 text-3xl font-semibold lowercase text-zinc-50">
              {active.title}
            </h3>
            <p className="mb-4 max-w-md text-sm leading-relaxed text-zinc-400">
              {active.summary.split("\n\n")[0]}
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              {active.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-100">
              view case study
              <span aria-hidden>→</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
