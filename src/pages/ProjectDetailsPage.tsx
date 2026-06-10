import { Link, useParams } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";

function toParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
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
  const { projects } = useProjects();
  const project = projects.find((p) => p.slug === slug);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-zinc-50">
            {project.title}
          </h1>
          {project.links && project.links.length > 0 && (
            <a
              href={project.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-between px-4 py-2 w-full sm:w-auto border border-white/70 bg-white text-[9px] sm:text-[10px] text-zinc-950 tracking-[0.16em] lowercase font-dmMono transition-colors duration-200 shadow-sm hover:bg-white/90"
            >
              <span className="font-bold">{project.links[0].label}</span>
              <span className="ml-2 inline-flex items-center justify-center text-[9px] sm:text-[10px] text-zinc-950">
                ↗︎
              </span>
            </a>
          )}
        </div>
        <p className="text-xs text-zinc-400">{project.role}</p>
      </div>

      {/* Snapshots */}
      {project.snapshots && project.snapshots.length > 0 && (
        <section className="space-y-3">
          <SectionLabel label="snapshots" />
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {project.snapshots.map((shot, index) => (
              <figure
                key={`${shot.src}-${index}`}
                className="overflow-hidden rounded-apple-md border border-white/5 bg-zinc-900/60 shadow-soft"
              >
                <img
                  src={shot.src}
                  alt={shot.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
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
        <div className="space-y-10 border-t border-white/5 pt-10">
          {project.problem && (
            <section className="space-y-4">
              <SectionLabel label="the problem" />
              <div className="max-w-2xl">
                {toParagraphs(project.problem).map((paragraph, index) => (
                  <p key={index} className="text-sm text-zinc-300 leading-relaxed mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {project.process && (
            <section className="space-y-4">
              <SectionLabel label="process" />
              <div className="max-w-2xl">
                {toParagraphs(project.process).map((paragraph, index) => (
                  <p key={index} className="text-sm text-zinc-300 leading-relaxed mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {project.keyDecisions && project.keyDecisions.length > 0 && (
            <section className="space-y-4">
              <SectionLabel label="key design decisions" />
              <ul className="space-y-4 max-w-2xl">
                {project.keyDecisions.map((decision, index) => {
                  const [title, ...rest] = decision.split(" — ");
                  const body = rest.join(" — ");
                  return (
                    <li key={index} className="flex gap-4">
                      <span
                        className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border"
                        style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        {body ? (
                          <>
                            <span className="text-sm text-zinc-200 font-medium">{title}</span>
                            <span className="text-sm text-zinc-400"> — {body}</span>
                          </>
                        ) : (
                          <span className="text-sm text-zinc-300">{decision}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {project.outcome && (
            <section className="space-y-4">
              <SectionLabel label="outcome" />
              <div className="max-w-2xl">
                {toParagraphs(project.outcome).map((paragraph, index) => (
                  <p key={index} className="text-sm text-zinc-300 leading-relaxed mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Additional context */}
      {project.description && (
        <section className="space-y-4 border-t border-white/5 pt-10">
          <SectionLabel label="context" />
          <div className="max-w-2xl">
            {toParagraphs(project.description).map((paragraph, index) => (
              <p key={`desc-${index}`} className="text-sm text-zinc-400 leading-relaxed mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
