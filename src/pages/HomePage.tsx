import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { useResume } from "../context/ResumeContext";

const heroPhrases = [
  "a product designer",
  "a sound designer",
];

const greetings = [
  "hello",      // English
  "hola",       // Spanish
  "bonjour",    // French
  "ciao",       // Italian
  "こんにちは",   // Japanese
  "bawo",       // Yoruba
  "olá",        // Portuguese
  "hallo",      // German
];

const experienceItems = [
  {
    id: "airtel",
    title: "Product Design & IT Intern",
    company: "Airtel Nigeria",
    year: "2025",
    accentColor: "#FF4949",
    textColor: "#FFFFFF",
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
    year: "2024",
    accentColor: "#FFFFFF",
    textColor: "#000000",
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
    year: "2023",
    accentColor: "#65DB61",
    textColor: "#153314",
    bullets: [
      "Designed promotional graphics and visual content for the organization's social media platforms using Adobe Illustrator, maintaining brand consistency across all materials.",
      "Shot and edited photography for events and services, producing polished visual assets for print and digital use.",
      "Edited video content for recaps, highlights, and promotional materials distributed across social channels.",
      "Provided creative direction for media productions, coordinating visual style and ensuring cohesive storytelling across formats.",
      "Managed live streaming operations for services and events, overseeing technical setup and real-time broadcast quality.",
    ],
  },
];

const skills = [
  { label: "Tools", items: ["Figma", "Framer", "Adobe Illustrator"], accent: "#4CB3FF" },
  { label: "Methods", items: ["User research", "Interaction design", "Information architecture", "Prototyping", "Design systems"], accent: "#B3FFCB" },
  { label: "Development", items: ["React", "TypeScript", "Tailwind CSS"], accent: "#FF4949" },
];

export function HomePage() {
  const { projects, loading: projectsLoading } = useProjects();
  const { resumeUrl } = useResume();
  const navigate = useNavigate();
  const [activePhrase, setActivePhrase] = useState(0);
  const [activeGreeting, setActiveGreeting] = useState(0);
  const phraseHeightRef = useRef<number>(0);
  const phraseContainerRef = useRef<HTMLDivElement>(null);
  const [mobileStackIndex, setMobileStackIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(1);
  const isDraggingRef = useRef(false);
  const [openExpCard, setOpenExpCard] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (phraseContainerRef.current) {
      const firstPhrase = phraseContainerRef.current.querySelector('div');
      if (firstPhrase) {
        phraseHeightRef.current = (firstPhrase as HTMLElement).clientHeight;
      }
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActivePhrase((current) => (current + 1) % heroPhrases.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const greetingInterval = window.setInterval(() => {
      setActiveGreeting((current) => (current + 1) % greetings.length);
    }, 3000);

    return () => window.clearInterval(greetingInterval);
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="space-y-6 sm:space-y-5 pt-0">
        {/* Top meta */}
        <div className="flex items-center justify-between gap-6 text-[11px] text-zinc-400 font-dmMono tracking-[0.12em]">
          <div className="flex-1 max-w-xs mx-4 ml-0 relative" style={{ minWidth: "48px", height: "1.2em" }}>
            <motion.div
              key={greetings[activeGreeting]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute left-0 top-0 whitespace-nowrap"
            >
              {greetings[activeGreeting]}
            </motion.div>
          </div>
          <p className="text-right whitespace-nowrap">available for new projects</p>
        </div>

        {/* Hero Heading and Phrases */}
        <div className="space-y-0 sm:space-y-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight text-zinc-50 flex items-center gap-2">
            <span className="flex items-center relative" style={{ width: "max-content" }}>
              i&apos;m&nbsp;
              <span className="relative font-semibold" style={{ color: "#f0f0f0" }}>
                mirireoluwa
              </span>
              ,
            </span>
          </h1>

          <div
            id="phrase-container"
            ref={phraseContainerRef}
            className="relative overflow-visible select-none -mt-2 sm:mt-0"
            style={{ height: phraseHeightRef.current ? `${phraseHeightRef.current * 1.5}px` : '2.4em', width: 'max-content', zIndex: 10 }}
            aria-live="polite"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={activePhrase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-zinc-50"
                style={{ whiteSpace: "nowrap", display: "inline-block" }}
              >
                {heroPhrases[activePhrase]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="space-y-8">
        <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <p>.projects</p>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Loading skeleton — avoids flashing bundled defaults before CMS data arrives */}
        {projectsLoading && (
          <>
            <div className="lg:hidden h-[400px] rounded-2xl border border-white/10 bg-zinc-900/60 animate-pulse" />
            <div className="hidden lg:grid gap-6 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-72 rounded-2xl border border-white/10 bg-zinc-900/60 animate-pulse" />
              ))}
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
                  const previewImage = project.snapshots?.[0];
                  return (
                    <div
                      className="flex flex-col h-full cursor-pointer bg-zinc-900"
                      onClick={() => { if (!isDraggingRef.current) navigate(`/projects/${project.slug}`); }}
                    >
                      <div className="relative flex-1 overflow-hidden bg-zinc-950">
                        {previewImage ? (
                          <img
                            src={previewImage.src}
                            alt={previewImage.alt}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="absolute inset-0" style={{ backgroundColor: project.accentColor, opacity: 0.15 }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/10 to-transparent" />
                        {/* Floating badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/50 backdrop-blur-md px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-zinc-200">
                            <span className="h-1.5 w-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: project.accentColor }} />
                            {project.category}
                          </span>
                          <span className="rounded-md border border-white/15 bg-black/50 backdrop-blur-md px-2 py-1 text-[9px] font-dmMono text-zinc-300">
                            {project.year}
                          </span>
                        </div>
                      </div>
                      <div className="relative p-4 pb-3.5 flex-shrink-0 border-t border-white/5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg font-medium lowercase text-zinc-50 truncate">{project.title}</h3>
                            {project.tags?.[0] && (
                              <p className="mt-0.5 text-[10px] text-zinc-500 truncate">{project.tags[0]}</p>
                            )}
                          </div>
                          <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-zinc-400">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] text-zinc-600 font-dmMono tracking-[0.08em]">swipe to browse</p>
            <div className="flex items-center gap-2">
              {projects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSwipeDir(i > mobileStackIndex ? 1 : -1);
                    setMobileStackIndex(i);
                  }}
                  className={`h-1.5 rounded-sm transition-all duration-300 ${
                    i === mobileStackIndex ? "w-6 bg-zinc-200" : "w-1.5 bg-zinc-600 hover:bg-zinc-400"
                  }`}
                  aria-label={`Go to project ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        )}

        {/* ── Desktop: grid ── */}
        {!projectsLoading && (
        <div className="hidden lg:grid gap-6 lg:grid-cols-3">
          {projects.map((project) => {
            const previewImage = project.snapshots?.[0];
            return (
              <div
                key={project.slug}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/60 backdrop-blur-sm hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                onClick={() => navigate(`/projects/${project.slug}`)}
              >
                <div className="relative h-52 overflow-hidden flex-shrink-0 bg-zinc-950">
                  {previewImage ? (
                    <>
                      <img
                        src={previewImage.src}
                        alt={previewImage.alt}
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/10 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-zinc-900">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
                    </div>
                  )}
                  {/* Floating badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/50 backdrop-blur-md px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-zinc-200">
                      <span className="h-1.5 w-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: project.accentColor }} />
                      {project.category}
                    </span>
                    <span className="rounded-md border border-white/15 bg-black/50 backdrop-blur-md px-2 py-1 text-[9px] font-dmMono text-zinc-300">
                      {project.year}
                    </span>
                  </div>
                </div>
                <div className="relative p-4 pb-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold lowercase text-zinc-50 group-hover:text-white transition-colors duration-200">
                      {project.title}
                    </h3>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] text-zinc-500 line-clamp-1 pr-2">
                      {project.summary.split("\n\n")[0]}
                    </p>
                    <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-zinc-400 group-hover:bg-white group-hover:text-zinc-950 group-hover:border-white transition-all duration-300">
                      →
                    </span>
                  </div>
                </div>
                {/* Accent-tinted glow on hover */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `0 24px 60px -20px ${project.accentColor}66` }}
                />
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="space-y-6">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <p>.about</p>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <div className="grid gap-6 md:gap-10 md:grid-cols-[minmax(0,1fr),minmax(0,1.6fr)] items-start">
          {/* Photo — first on mobile via order */}
          <div className="order-first md:order-first relative w-full max-w-sm mx-auto md:mx-0 aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
            <img
              src="/about-photo-new.jpg"
              alt="Portrait of Mirireoluwa"
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
            <p className="text-sm md:text-base text-zinc-200 leading-relaxed">
              I'm a product designer who builds the things I design. I work at the intersection of user insight, visual craft, and product thinking—focused on experiences that are clear, considered, and actually useful. My background in Computer Science means I think about feasibility and implementation alongside aesthetics, which makes collaboration with engineering teams more direct. I also produce music as{" "}
              <a
                href="https://saintted.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
                style={{ color: "#FF4B63" }}
              >
                Saintted
              </a>
              , where I explore similar questions of form, emotion, and clarity—just through sound.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-zinc-400 font-dmMono tracking-[0.08em]">
                <span className="w-1.5 h-1.5 rounded-sm bg-[#00ff77] flex-shrink-0" />
                available for work
              </span>
              <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-zinc-400 font-dmMono tracking-[0.08em]">
                CS student
              </span>
              <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-zinc-400 font-dmMono tracking-[0.08em]">
                Lagos, NG
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="space-y-8">
        <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <p>.experience</p>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Accordion cards (all breakpoints) */}
        <div className="space-y-3">
          {experienceItems.map((item) => {
            const isOpen = openExpCard === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden border border-white/10 bg-zinc-900 transition-colors duration-200 hover:border-white/20"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 p-4 text-left"
                  onClick={() => setOpenExpCard(isOpen ? null : item.id)}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: item.accentColor }}
                    />
                    <div>
                      <p className="font-medium text-base leading-tight text-zinc-50">{item.title}</p>
                      <p className="text-xs text-zinc-500 mt-1 font-dmMono tracking-[0.04em]">
                        {item.company} · {item.year}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 text-xl leading-none text-zinc-500"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pl-[2.125rem]">
                        <div className="h-px bg-white/5 mb-3" />
                        <ul className="space-y-2.5">
                          {item.bullets.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-400">
                              <span className="mt-1.5 flex-shrink-0 text-[10px] text-zinc-600">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </section>

      {/* Skills */}
      <section id="skills" className="space-y-8">
        <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <p>.skills</p>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5 border border-white/5 rounded-xl overflow-hidden">
          {skills.map(({ label, items, accent }) => (
            <div key={label} className="p-5 space-y-4 bg-zinc-950/50">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}88` }}
                />
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-dmMono">{label}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 text-[11px] text-zinc-300 border border-white/10 bg-zinc-900/60 rounded-md hover:bg-white/10 hover:text-zinc-100 transition-all duration-200 cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section id="contact" className="space-y-6">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <p>.say hello</p>
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
            >
              <div className="relative w-5 h-5">
                <img
                  src="/mail-white.svg"
                  alt="Email"
                  className="absolute inset-0 w-5 h-5 transition-opacity duration-200 group-hover:opacity-0"
                />
                <img
                  src="/mail-black.svg"
                  alt="Email"
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
            >
              <div className="relative w-5 h-5">
                <img
                  src="/linkedin-white.svg"
                  alt="LinkedIn"
                  className="absolute inset-0 w-5 h-5 transition-opacity duration-200 group-hover:opacity-0"
                />
                <img
                  src="/linkedin.svg"
                  alt="LinkedIn"
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
            >
              <div className="relative w-5 h-5">
                <img
                  src="/github-white.svg"
                  alt="GitHub"
                  className="absolute inset-0 w-5 h-5 transition-opacity duration-200 group-hover:opacity-0"
                />
                <img
                  src="/github-black.svg"
                  alt="GitHub"
                  className="absolute inset-0 w-5 h-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              </div>
              <span className="text-sm font-medium">GitHub</span>
            </a>

            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/40 bg-transparent text-zinc-200 hover:bg-white hover:text-zinc-950 transition-colors duration-200 group"
              aria-label="Download résumé"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              <span className="text-sm font-medium">Résumé</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
