import { useState, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { Hero } from "../components/Hero";
import { ProjectShowcase } from "../components/ProjectShowcase";
import { ProjectCardFace } from "../components/ProjectCardFace";
import { ExperienceSection } from "../components/ExperienceSection";
import { RichText } from "../components/RichText";
import {
  FigmaIcon,
  FramerIcon,
  IllustratorIcon,
  ReactIcon,
  TypeScriptIcon,
  TailwindIcon,
  SparkleIcon,
  LightroomIcon,
  AbletonIcon,
} from "../components/LogoIcons";

const toolLogos = [
  { name: "Figma", Icon: FigmaIcon, color: "#F24E1E" },
  { name: "Framer", Icon: FramerIcon, color: "#0055FF" },
  { name: "Adobe Illustrator", Icon: IllustratorIcon, color: "#FF9A00" },
  { name: "Adobe Lightroom", Icon: LightroomIcon, color: "#31A8FF" },
  { name: "Ableton", Icon: AbletonIcon, color: "#FFB800" },
  { name: "React", Icon: ReactIcon, color: "#61DAFB" },
  { name: "TypeScript", Icon: TypeScriptIcon, color: "#3178C6" },
  { name: "Tailwind CSS", Icon: TailwindIcon, color: "#38BDF8" },
];

const methods = [
  { name: "User research", color: "#4CB3FF" },
  { name: "Interaction design", color: "#B3FFCB" },
  { name: "Information architecture", color: "#FFA100" },
  { name: "Prototyping", color: "#B23386" },
  { name: "Design systems", color: "#FF4949" },
  { name: "Sound design", color: "#FF4B63" },
];

export function HomePage() {
  const { projects, site, loading: projectsLoading } = useProjects();
  const navigate = useNavigate();
  const [mobileStackIndex, setMobileStackIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(1);
  const isDraggingRef = useRef(false);

  return (
    <div className="space-y-20">
      <Hero />

      {/* Projects */}
      <section id="projects" className="space-y-8 !mt-10 scroll-mt-24">
        <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
          <h2>.projects</h2>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Loading skeleton — avoids flashing bundled defaults before CMS data arrives */}
        {projectsLoading && (
          <>
            <div className="lg:hidden h-[400px] rounded-2xl border border-white/10 bg-zinc-900/60 animate-pulse" />
            <div className="hidden lg:grid grid-cols-[300px_1fr] gap-10">
              <div className="h-[300px] rounded-2xl border border-white/10 bg-zinc-900/60 animate-pulse" />
              <div className="h-[440px] rounded-2xl border border-white/10 bg-zinc-900/60 animate-pulse" />
            </div>
          </>
        )}

        {/* ── Mobile: swipeable card stack ── */}
        {!projectsLoading && (
        <div className="lg:hidden space-y-5">
          <div className="relative h-[400px]">
            {/* Background cards (decorative stack, rendered back→front) */}
            {[2, 1].map((offset) => {
              const idx = mobileStackIndex + offset;
              if (idx >= projects.length) return null;
              const p = projects[idx];
              const img = p.snapshots?.[0];
              return (
                <div
                  key={`stack-bg-${p.slug}`}
                  className="absolute inset-x-0 top-0 bottom-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 pointer-events-none"
                  style={{
                    transform: `scale(${1 - offset * 0.04}) translateY(${offset * 16}px)`,
                    transformOrigin: "top center",
                    zIndex: 10 - offset,
                  }}
                >
                  {img && (
                    <img src={img.src} alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-10" />
                  )}
                </div>
              );
            })}

            {/* Active draggable top card */}
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={mobileStackIndex}
                className="absolute inset-x-0 top-0 bottom-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 cursor-grab active:cursor-grabbing"
                style={{ zIndex: 12, touchAction: "pan-y" }}
                initial={{ x: swipeDir * 280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: swipeDir * -280, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 26 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                dragMomentum={false}
                whileDrag={{ scale: 0.97 }}
                onDragStart={() => { isDraggingRef.current = true; }}
                onDragEnd={(_, info) => {
                  isDraggingRef.current = false;
                  const swipedLeft = info.velocity.x < -400 || info.offset.x < -70;
                  const swipedRight = info.velocity.x > 400 || info.offset.x > 70;
                  if (swipedLeft && mobileStackIndex < projects.length - 1) {
                    setSwipeDir(1);
                    setMobileStackIndex((i) => i + 1);
                  } else if (swipedRight && mobileStackIndex > 0) {
                    setSwipeDir(-1);
                    setMobileStackIndex((i) => i - 1);
                  }
                }}
              >
                {(() => {
                  const project = projects[mobileStackIndex];
                  return (
                    <div
                      className="h-full cursor-pointer"
                      onClick={() => { if (!isDraggingRef.current) navigate(`/projects/${project.slug}`); }}
                    >
                      <ProjectCardFace project={project} compact />
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] text-zinc-400 font-dmMono tracking-[0.08em]">swipe to browse</p>
            <div className="flex items-center">
              {projects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSwipeDir(i > mobileStackIndex ? 1 : -1);
                    setMobileStackIndex(i);
                  }}
                  className="group flex h-6 min-w-6 items-center justify-center"
                  aria-label={`Go to project ${i + 1}`}
                  aria-current={i === mobileStackIndex ? "true" : undefined}
                >
                  <span
                    className={`block h-1.5 rounded-sm transition-all duration-300 ${
                      i === mobileStackIndex ? "w-6 bg-zinc-200" : "w-1.5 bg-zinc-500 group-hover:bg-zinc-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* ── Desktop: title list + crossfading preview ── */}
        {!projectsLoading && <ProjectShowcase projects={projects} />}
      </section>

      {/* About */}
      <section id="about" className="space-y-6">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
          <h2>.about</h2>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <div className="grid gap-6 md:gap-10 md:grid-cols-[minmax(0,1fr),minmax(0,1.6fr)] items-start">
          {/* Photo — first on mobile via order */}
          <div className="order-first md:order-first relative w-full max-w-sm mx-auto md:mx-0 aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
            <img
              src={site.about.photoUrl || "/about-photo-new.jpg"}
              alt={site.about.photoAlt}
              width={768}
              height={1024}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_55%)] opacity-25" />
            </div>
          </div>

          {/* Text + metadata */}
          <div className="space-y-6 md:pt-2">
            <div className="space-y-4">
              <RichText text={site.about.body} className="text-sm md:text-base text-zinc-200 leading-relaxed" />
            </div>

            {site.about.chips.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                {site.about.chips.map((c) => (
                  <li
                    key={c.label}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-zinc-400 font-dmMono tracking-[0.08em]"
                  >
                    {c.live && <span className="w-1.5 h-1.5 rounded-sm bg-[#00ff77] flex-shrink-0" aria-hidden />}
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="space-y-8">
        <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
          <h2>.experience</h2>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <ExperienceSection items={site.experience} />
      </section>

      {/* Skills */}
      <section id="skills" className="space-y-6">
        <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
          <h2>.skills</h2>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Multi-layered ticker: tools/frameworks scroll one way, methods scroll the other */}
        <div
          className="relative space-y-1 overflow-hidden py-2"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          {/* Row 1 — tools & frameworks, real brand marks */}
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {[...toolLogos, ...toolLogos].map(({ name, Icon, color }, i) => (
              <div
                key={`${name}-${i}`}
                className="group/logo flex flex-shrink-0 items-center gap-3 px-8 py-3"
                style={{ "--brand": color } as CSSProperties}
              >
                <Icon className="h-7 w-7 flex-shrink-0 text-zinc-400 transition-all duration-300 ease-out group-hover/logo:text-[var(--brand)] group-hover/logo:scale-110" />
                <span className="whitespace-nowrap font-sfPro text-[12px] font-bold tracking-[0.06em] text-zinc-400 transition-colors duration-300 group-hover/logo:text-[var(--brand)]">
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Row 2 — methods & practices, generic mark, opposite direction */}
          <div className="flex w-max animate-marquee [animation-direction:reverse] hover:[animation-play-state:paused]">
            {[...methods, ...methods].map(({ name, color }, i) => (
              <div
                key={`${name}-${i}`}
                className="group/logo flex flex-shrink-0 items-center gap-3 px-8 py-3"
                style={{ "--brand": color } as CSSProperties}
              >
                <SparkleIcon className="h-6 w-6 flex-shrink-0 text-zinc-700 transition-all duration-300 ease-out group-hover/logo:text-[var(--brand)] group-hover/logo:scale-110" />
                <span className="whitespace-nowrap font-sfPro text-[12px] font-bold tracking-[0.06em] text-zinc-400 transition-colors duration-300 group-hover/logo:text-[var(--brand)]">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section id="contact" className="space-y-6">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
          <h2>.say hello</h2>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-50 max-w-3xl">
            i'm open to collaborate and work on paradigm-shifting projects. send me an email or connect with me on linkedin.
          </h2>

          <div className="flex flex-row flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "mailto:olukannichristian@gmail.com?subject=Project%20inquiry";
              }}
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/40 bg-transparent text-zinc-200 hover:bg-white hover:text-zinc-950 transition-colors duration-200 group"
              aria-label="Contact me via email"
              data-track="contact_email"
            >
              <div className="relative w-5 h-5">
                <img
                  src="/mail-white.svg"
                  alt=""
                  className="absolute inset-0 w-5 h-5 transition-opacity duration-200 group-hover:opacity-0"
                />
                <img
                  src="/mail-black.svg"
                  alt=""
                  className="absolute inset-0 w-5 h-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              </div>
              <span className="text-sm font-medium">Email</span>
            </button>

            <a
              href="https://www.linkedin.com/in/mirireoluwaolukanni/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/40 bg-transparent text-zinc-200 hover:bg-white hover:text-zinc-950 transition-colors duration-200 group"
              aria-label="LinkedIn profile"
              data-track="contact_linkedin"
            >
              <div className="relative w-5 h-5">
                <img
                  src="/linkedin-white.svg"
                  alt=""
                  className="absolute inset-0 w-5 h-5 transition-opacity duration-200 group-hover:opacity-0"
                />
                <img
                  src="/linkedin.svg"
                  alt=""
                  className="absolute inset-0 w-5 h-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              </div>
              <span className="text-sm font-medium">LinkedIn</span>
            </a>

            <a
              href="https://github.com/mirireoluwa"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/40 bg-transparent text-zinc-200 hover:bg-white hover:text-zinc-950 transition-colors duration-200 group"
              aria-label="GitHub profile"
              data-track="contact_github"
            >
              <div className="relative w-5 h-5">
                <img
                  src="/github-white.svg"
                  alt=""
                  className="absolute inset-0 w-5 h-5 transition-opacity duration-200 group-hover:opacity-0"
                />
                <img
                  src="/github-black.svg"
                  alt=""
                  className="absolute inset-0 w-5 h-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              </div>
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
