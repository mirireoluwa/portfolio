import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types/project";
import { ProjectCardFace } from "./ProjectCardFace";

const LIST_MAX_HEIGHT = 440;

/**
 * Desktop project browser ("option B" from the card-redesign comparison) —
 * a title list on the left, a single preview panel on the right that
 * crossfades to whichever project is hovered/focused. Mobile keeps the
 * separate swipeable card stack in HomePage; the two don't share a mechanic
 * on purpose (hover doesn't exist on touch), but both render the project
 * face with the shared ProjectCardFace so they read as one card system.
 *
 * The list scrolls internally past ~4 projects instead of growing the
 * section — the preview panel's height stays fixed regardless of how many
 * projects exist.
 */
export function ProjectShowcase({ projects }: { projects: Project[] }) {
  const navigate = useNavigate();
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug);
  const active = projects.find((p) => p.slug === activeSlug) ?? projects[0];

  const listRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  // Only show a "scroll for more" hint once the list actually outgrows its
  // box — with 4 projects (today) it never appears.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [projects.length]);

  const handleListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
  };

  if (!active) return null;

  return (
    <div className="hidden lg:grid grid-cols-[300px_1fr] items-start gap-10">
      {/* Title list — scrolls on its own past a handful of projects */}
      <div className="relative">
        <div
          ref={listRef}
          onScroll={handleListScroll}
          className="no-scrollbar flex flex-col overflow-y-auto border-t border-white/10"
          style={{
            maxHeight: LIST_MAX_HEIGHT,
            maskImage: "linear-gradient(to bottom, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black 90%, transparent)",
          }}
        >
        {projects.map((project, i) => {
          const isActive = project.slug === activeSlug;
          return (
            <button
              key={project.slug}
              type="button"
              onMouseEnter={() => setActiveSlug(project.slug)}
              onFocus={() => setActiveSlug(project.slug)}
              onClick={() => navigate(`/projects/${project.slug}`)}
              className="group flex-shrink-0 border-b border-white/10 py-5 pr-4 text-left"
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

        {hasOverflow && !atBottom && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-1">
            <span className="motion-reduce:animate-none flex animate-bounce items-center gap-1.5 rounded-full border border-white/10 bg-zinc-950/85 px-3 py-1 font-dmMono text-[9px] uppercase tracking-[0.1em] text-zinc-400 backdrop-blur-sm">
              scroll for more ↓
            </span>
          </div>
        )}
      </div>

      {/* Preview panel — fixed height no matter how many projects exist */}
      <div
        className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
        style={{ height: LIST_MAX_HEIGHT }}
        onClick={() => navigate(`/projects/${active.slug}`)}
      >
        {projects.map((project) => (
          <div
            key={project.slug}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: project.slug === activeSlug ? 1 : 0 }}
            aria-hidden={project.slug !== activeSlug}
          >
            <ProjectCardFace project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}
