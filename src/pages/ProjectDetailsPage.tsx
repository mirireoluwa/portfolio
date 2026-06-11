import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";

function toParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Image with a shimmer placeholder until it finishes loading */
function SnapshotImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-zinc-800/70" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
        loading="eager"
      />
    </>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
      <p>.{label}</p>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}

export function ProjectDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { projects, loading } = useProjects();
  const project = projects.find((p) => p.slug === slug);

  const [snapIndex, setSnapIndex] = useState(0);
  const [snapDir, setSnapDir] = useState<1 | -1>(1);
  const isSnapDraggingRef = useRef(false);

  // React Router reuses this component instance across project navigation,
  // so swiper state must be reset explicitly when the slug changes.
  useEffect(() => {
    setSnapIndex(0);
    setSnapDir(1);
    window.scrollTo({ top: 0 });
  }, [slug]);

  const snapshots = project?.snapshots ?? [];
  const total = snapshots.length;
  // Guard against a stale index from a project with more snapshots
  const safeSnapIndex = total > 0 ? Math.min(snapIndex, total - 1) : 0;

  function goToSnap(dir: 1 | -1) {
    setSnapDir(dir);
    setSnapIndex((safeSnapIndex + dir + total) % total);
  }

  if (!project && loading) {
    return (
      <div className="pt-6 space-y-10 animate-pulse">
        <div className="h-4 w-32 rounded bg-zinc-900/80" />
        <div className="space-y-3">
          <div className="h-3 w-40 rounded bg-zinc-900/80" />
          <div className="h-12 w-2/3 rounded bg-zinc-900/80" />
        </div>
        <div className="w-full rounded-xl bg-zinc-900/60" style={{ aspectRatio: "16/9" }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-10 space-y-6">
        <p className="text-sm text-zinc-300">Project not found.</p>
        <Link
          to="/"
          className="inline-flex items-center text-xs text-zinc-300 underline underline-offset-4 decoration-zinc-600 hover:text-zinc-50"
        >
          ←  Back to projects
        </Link>
      </div>
    );
  }

  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const prevProject =
    projects[(currentIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const hasCaseStudy =
    project.problem || project.process || project.keyDecisions?.length || project.outcome;

  return (
    <div className="pt-6 space-y-10">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-xs text-zinc-300 underline underline-offset-4 decoration-zinc-600 hover:text-zinc-50"
        >
          ←   Back to projects
        </Link>
        <div className="flex items-center gap-3 text-xs text-zinc-300">
          <Link
            to={`/projects/${prevProject.slug}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 transition-colors duration-200"
            aria-label="Previous project"
          >
            ‹
          </Link>
          <Link
            to={`/projects/${nextProject.slug}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 transition-colors duration-200"
            aria-label="Next project"
          >
            ›
          </Link>
        </div>
      </div>

      {/* Title block */}
      <div className="space-y-3">
        <p className="text-[11px] text-zinc-400 font-dmMono lowercase tracking-[0.12em]">
          {project.year} • {project.category}
        </p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-zinc-50">
            {project.title}
          </h1>
          {project.links && project.links.length > 0 && (
            <a
              href={project.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center flex-shrink-0 px-4 py-2 rounded-md text-[10px] uppercase tracking-[0.14em] font-bold transition-opacity duration-150 hover:opacity-80"
              style={{ backgroundColor: project.accentColor, color: project.accentTextColor }}
            >
              visit
            </a>
          )}
        </div>
        <p className="text-xs text-zinc-400">{project.role}</p>
      </div>

      {/* Snapshots — swipeable carousel */}
      {snapshots.length > 0 && (
        <section className="space-y-3" key={`${project.slug}-snaps`}>
          <div className="flex items-center justify-between">
            <SectionLabel label="snapshots" />
            {total > 1 && (
              <p className="text-[10px] font-dmMono text-zinc-500 tracking-[0.12em] lowercase">
                {safeSnapIndex + 1} / {total}
              </p>
            )}
          </div>

          {total === 1 ? (
            /* Single image — no swiper needed */
            <figure
              className="relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/60 shadow-soft"
              style={{ aspectRatio: "16/9" }}
            >
              <SnapshotImage src={snapshots[0].src} alt={snapshots[0].alt} />
            </figure>
          ) : (
            /* Multi-image swiper */
            <div className="space-y-3">
              <div className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-zinc-900/60 shadow-soft"
                style={{ aspectRatio: "16/9" }}
              >
                <AnimatePresence mode="sync" initial={false}>
                  <motion.figure
                    key={`${project.slug}-${safeSnapIndex}`}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    initial={{ x: snapDir * 320, opacity: 0.6 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: snapDir * -320, opacity: 0.6 }}
                    transition={{ type: "spring", stiffness: 200, damping: 26 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    dragMomentum={false}
                    onDragStart={() => { isSnapDraggingRef.current = true; }}
                    onDragEnd={(_, info) => {
                      isSnapDraggingRef.current = false;
                      if (info.velocity.x < -400 || info.offset.x < -70) {
                        goToSnap(1);
                      } else if (info.velocity.x > 400 || info.offset.x > 70) {
                        goToSnap(-1);
                      }
                    }}
                  >
                    <SnapshotImage
                      src={snapshots[safeSnapIndex].src}
                      alt={snapshots[safeSnapIndex].alt}
                    />
                  </motion.figure>
                </AnimatePresence>

                {/* Desktop arrow buttons */}
                <button
                  type="button"
                  onClick={() => goToSnap(-1)}
                  className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-black/40 border border-white/10 text-zinc-300 hover:bg-black/60 hover:text-white transition-colors duration-150 backdrop-blur-sm"
                  aria-label="Previous snapshot"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goToSnap(1)}
                  className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-black/40 border border-white/10 text-zinc-300 hover:bg-black/60 hover:text-white transition-colors duration-150 backdrop-blur-sm"
                  aria-label="Next snapshot"
                >
                  ›
                </button>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-1.5">
                {snapshots.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSnapDir(i > safeSnapIndex ? 1 : -1); setSnapIndex(i); }}
                    className={`transition-all duration-200 rounded-full ${
                      i === safeSnapIndex
                        ? "w-4 h-1.5 bg-zinc-300"
                        : "w-1.5 h-1.5 bg-zinc-600 hover:bg-zinc-400"
                    }`}
                    aria-label={`Go to snapshot ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Summary intro */}
      <section className="space-y-4">
        <SectionLabel label="overview" />
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)] items-start">
          <div className="space-y-4">
            {toParagraphs(project.summary).map((paragraph, index) => (
              <p key={`summary-${index}`} className="text-sm md:text-base text-zinc-200 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Aside — role and tags */}
          <aside className="space-y-4 rounded-apple-lg border border-white/5 bg-surface/80 p-4">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">role</h2>
              <p className="mt-1 text-xs text-zinc-200">{project.role}</p>
            </div>
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">disciplines</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-900/60 border border-white/5 px-2 py-0.5 text-[10px] text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">year</h2>
              <p className="mt-1 text-xs text-zinc-200">{project.year}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Case study sections */}
      {hasCaseStudy && (
        <div className="space-y-12 border-t border-white/5 pt-10">
          {project.problem && (
            <section className="space-y-5">
              <SectionLabel label="the problem" />
              <div
                className="max-w-3xl border-l-2 pl-5 sm:pl-6"
                style={{ borderColor: project.accentColor }}
              >
                {toParagraphs(project.problem).map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base sm:text-lg text-zinc-200 leading-relaxed mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {project.process && (
            <section className="space-y-5">
              <SectionLabel label="process" />
              <div className="max-w-2xl">
                {toParagraphs(project.process).map((paragraph, index) => (
                  <p key={index} className="text-sm text-zinc-300 leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {project.keyDecisions && project.keyDecisions.length > 0 && (
            <section className="space-y-5">
              <SectionLabel label="key design decisions" />
              <div className="grid gap-4 sm:grid-cols-2">
                {project.keyDecisions.map((decision, index) => {
                  const [title, ...rest] = decision.split(" — ");
                  const body = rest.join(" — ");
                  return (
                    <div
                      key={index}
                      className="group rounded-xl border border-white/5 bg-zinc-900/40 p-5 transition-colors duration-200 hover:border-white/15 hover:bg-zinc-900/70"
                    >
                      <span
                        className="block text-2xl font-dmMono leading-none opacity-80"
                        style={{ color: project.accentColor }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {body ? (
                        <>
                          <p className="mt-3 text-sm font-medium text-zinc-100">{title}</p>
                          <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">{body}</p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{decision}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {project.outcome && (
            <section className="space-y-5">
              <SectionLabel label="outcome" />
              <div
                className="relative overflow-hidden rounded-xl border p-6 sm:p-8"
                style={{
                  borderColor: `${project.accentColor}33`,
                  backgroundColor: `${project.accentColor}0d`,
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: project.accentColor }}
                />
                <div className="max-w-2xl">
                  {toParagraphs(project.outcome).map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-sm sm:text-base text-zinc-200 leading-relaxed mb-4 last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Additional context / main description for projects without case study */}
      {project.description && (
        <section className={`space-y-4 ${hasCaseStudy ? "border-t border-white/5 pt-10" : ""}`}>
          <SectionLabel label={hasCaseStudy ? "context" : "about this project"} />
          <div className="max-w-2xl">
            {toParagraphs(project.description).map((paragraph, index) => (
              <p
                key={`desc-${index}`}
                className={`text-sm leading-relaxed mb-3 last:mb-0 ${hasCaseStudy ? "text-zinc-400" : "text-zinc-200"}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
