import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";

const heroPhrases = [
  "a product designer",
  "a producer",
  "a visionary",
  "an ultra-creative",
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

const skills = [
  { label: "Tools", items: ["Figma", "Framer", "Adobe Illustrator"], accent: "#4CB3FF" },
  { label: "Methods", items: ["User research", "Interaction design", "Information architecture", "Prototyping", "Design systems"], accent: "#B3FFCB" },
  { label: "Development", items: ["React", "TypeScript", "Tailwind CSS"], accent: "#FF4949" },
];

export function HomePage() {
  const { projects } = useProjects();
  const [activePhrase, setActivePhrase] = useState(0);
  const [activeGreeting, setActiveGreeting] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const phraseHeightRef = useRef<number>(0);
  const phraseContainerRef = useRef<HTMLDivElement>(null);
  const [mobileStackIndex, setMobileStackIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(1);
  const isDraggingRef = useRef(false);

  const toggleCard = (cardId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

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

        {/* ── Mobile: swipeable card stack ── */}
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
                  className="absolute inset-x-0 top-0 bottom-0 rounded-xl overflow-hidden border border-white/10 pointer-events-none"
                  style={{
                    transform: `scale(${1 - offset * 0.04}) translateY(${offset * 16}px)`,
                    transformOrigin: "top center",
                    zIndex: 10 - offset,
                    backgroundColor: p.accentColor,
                  }}
                >
                  {img && (
                    <img src={img.src} alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-20" />
                  )}
                </div>
              );
            })}

            {/* Active draggable top card */}
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={mobileStackIndex}
                className="absolute inset-x-0 top-0 bottom-0 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 cursor-grab active:cursor-grabbing"
                style={{ zIndex: 12 }}
                initial={{ x: swipeDir * 280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: swipeDir * -280, opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                whileDrag={{ scale: 0.98 }}
                onDragStart={() => { isDraggingRef.current = true; }}
                onDragEnd={(_, info) => {
                  setTimeout(() => { isDraggingRef.current = false; }, 100);
                  if (info.offset.x < -70 && mobileStackIndex < projects.length - 1) {
                    setSwipeDir(1);
                    setMobileStackIndex((i) => i + 1);
                  } else if (info.offset.x > 70 && mobileStackIndex > 0) {
                    setSwipeDir(-1);
                    setMobileStackIndex((i) => i - 1);
                  }
                }}
              >
                {(() => {
                  const project = projects[mobileStackIndex];
                  const previewImage = project.snapshots?.[0];
                  return (
                    <Link
                      to={`/projects/${project.slug}`}
                      className="flex flex-col h-full"
                      onClick={(e) => { if (isDraggingRef.current) e.preventDefault(); }}
                    >
                      <div className="relative flex-1 overflow-hidden" style={{ backgroundColor: project.accentColor }}>
                        {previewImage && (
                          <div className="absolute inset-3 rounded-xl overflow-hidden">
                            <img
                              src={previewImage.src}
                              alt={previewImage.alt}
                              className="w-full h-full object-cover object-top opacity-80"
                            />
                          </div>
                        )}
                      </div>
                      <div
                        className="p-4 pb-3 flex-shrink-0"
                        style={{ backgroundColor: project.accentColor, color: project.accentTextColor }}
                      >
                        <div className="flex items-center justify-between text-[10px] font-dmMono lowercase tracking-[0.12em]">
                          <span>{project.year}</span>
                          <span>{project.category}</span>
                        </div>
                        <div className="mt-3 h-px opacity-30" style={{ backgroundColor: project.accentTextColor }} />
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold lowercase">{project.title}</h3>
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-xs">→</span>
                        </div>
                      </div>
                    </Link>
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
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === mobileStackIndex ? "w-6 bg-zinc-200" : "w-1.5 bg-zinc-600 hover:bg-zinc-400"
                  }`}
                  aria-label={`Go to project ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop: grid ── */}
        <div className="hidden lg:grid gap-6 lg:grid-cols-3">
          {projects.map((project) => {
            const previewImage = project.snapshots?.[0];
            return (
              <Link
                to={`/projects/${project.slug}`}
                key={project.slug}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="relative h-52 overflow-hidden flex-shrink-0" style={{ backgroundColor: project.accentColor }}>
                  {previewImage ? (
                    <>
                      <div className="absolute inset-3 group-hover:inset-0 rounded-xl group-hover:rounded-none overflow-hidden transition-all duration-400 ease-in-out">
                        <img
                          src={previewImage.src}
                          alt={previewImage.alt}
                          className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <p className="absolute bottom-3 left-3 right-3 text-[10px] text-zinc-200 leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 z-10">
                        {project.summary.split("\n\n")[0]}
                      </p>
                    </>
                  ) : (
                    <div className="absolute inset-3 rounded-xl overflow-hidden bg-zinc-800">
                      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(0,0,0,0.18)_25%,_transparent_25%,_transparent_50%,_rgba(0,0,0,0.18)_50%,_rgba(0,0,0,0.18)_75%,_transparent_75%,_transparent)] bg-[length:6px_6px] opacity-30" />
                    </div>
                  )}
                </div>
                <div
                  className="relative p-4 pb-3 flex-shrink-0"
                  style={{ backgroundColor: project.accentColor, color: project.accentTextColor }}
                >
                  <div className="flex items-center justify-between text-[10px] font-dmMono lowercase tracking-[0.12em]">
                    <span>{project.year}</span>
                    <span>{project.category}</span>
                  </div>
                  <div className="mt-3 h-px opacity-30" style={{ backgroundColor: project.accentTextColor }} />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold lowercase">{project.title}</h3>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-xs">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section id="about" className="space-y-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr),minmax(0,0.9fr)] items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
              <p>.about</p>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
            <h3 className="text-sm md:text-base text-zinc-200 leading-relaxed">
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
            </h3>
          </div>

          <div className="relative w-full max-w-xs md:max-w-sm md:ml-auto aspect-[3/4] rounded-apple-md overflow-hidden border border-white/10 bg-zinc-900">
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
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="space-y-8">
        <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <p>.experience</p>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="flex items-center justify-center gap-2 lg:hidden">
          <p className="text-xs text-zinc-400">
            Tap on the cards to view details
          </p>
          <div className="tap-icon-animation">
            <img
              src="/finger-gesture.svg"
              alt="Tap icon"
              className="w-[18px] h-[18px] text-zinc-400"
              style={{ filter: 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.9) contrast(0.9)' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Design & IT Intern - Airtel Nigeria */}
          <div
            className={`group h-80 perspective-1000 cursor-pointer ${flippedCards.has('airtel') ? 'flipped' : ''}`}
            onClick={() => toggleCard('airtel')}
          >
            <div className="relative w-full h-full flip-card-inner">
              {/* Front */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 shadow-soft flex flex-col p-6 backface-hidden"
                style={{ backgroundColor: "#FF4949", color: "#FFFFFF" }}
              >
                <div className="flex flex-col">
                  <h3 className="text-2xl font-semibold mb-2">Product Design & IT Intern</h3>
                  <p className="text-sm opacity-90">Airtel Nigeria • 2025</p>
                </div>
              </div>
              {/* Back */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 shadow-soft flex flex-col p-6 backface-hidden rotate-y-180"
                style={{ backgroundColor: "#FF4949", color: "#FFFFFF" }}
              >
                <ul className="space-y-2 text-sm leading-relaxed opacity-95 overflow-y-auto">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Designed and developed a project & task management application with features for projects, tasks, checklists, and dependencies, enabling potential use across multiple Airtel Nigeria departments.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Contributed to the design and implementation of a new USSD service, improving connectivity and user experience for millions of daily users.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Assisted in troubleshooting USSD service issues, improving service reliability and customer experience.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Built a Python application that organizes raw data dumps into structured files, improving data readability and accessibility across teams.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* UI/UX Design and Frontend Development Intern - Product Studio HQ */}
          <div
            className={`group h-80 perspective-1000 cursor-pointer ${flippedCards.has('product-studio') ? 'flipped' : ''}`}
            onClick={() => toggleCard('product-studio')}
          >
            <div className="relative w-full h-full flip-card-inner">
              {/* Front */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 shadow-soft flex flex-col p-6 backface-hidden"
                style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
              >
                <div className="flex flex-col">
                  <h3 className="text-2xl font-semibold mb-2">UI/UX Design & Frontend Intern</h3>
                  <p className="text-sm opacity-90">Product Studio HQ • 2024</p>
                </div>
              </div>
              {/* Back */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 shadow-soft flex flex-col p-6 backface-hidden rotate-y-180"
                style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
              >
                <ul className="space-y-2 text-sm leading-relaxed opacity-95 overflow-y-auto">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Designed intuitive user interfaces for a non-profit organization's website, enhancing its online presence and user engagement through Figma prototypes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Conceptualized and created UI designs and interactive prototypes in Figma for a wealth management application tailored to high-net-worth individuals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Developed and deployed responsive websites using React, TypeScript, and Tailwind CSS via Vercel, bridging design handoff and implementation.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Graphics Design Intern - City Church Lagos */}
          <div
            className={`group h-80 perspective-1000 cursor-pointer ${flippedCards.has('city-church') ? 'flipped' : ''}`}
            onClick={() => toggleCard('city-church')}
          >
            <div className="relative w-full h-full flip-card-inner">
              {/* Front */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 shadow-soft flex flex-col p-6 backface-hidden"
                style={{ backgroundColor: "#65DB61", color: "#153314" }}
              >
                <div className="flex flex-col">
                  <h3 className="text-2xl font-semibold mb-2">Media & Creative Intern</h3>
                  <p className="text-sm opacity-90">City Church Lagos • 2023</p>
                </div>
              </div>
              {/* Back */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 shadow-soft flex flex-col p-6 backface-hidden rotate-y-180"
                style={{ backgroundColor: "#65DB61", color: "#153314" }}
              >
                <ul className="space-y-2 text-sm leading-relaxed opacity-95 overflow-y-auto">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Designed promotional graphics and visual content for the organization's social media platforms using Adobe Illustrator, maintaining brand consistency across all materials.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Shot and edited photography for events and services, producing polished visual assets for print and digital use.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Edited video content for recaps, highlights, and promotional materials distributed across social channels.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Provided creative direction for media productions, coordinating visual style and ensuring cohesive storytelling across formats.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Managed live streaming operations for services and events, overseeing technical setup and real-time broadcast quality.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}88` }}
                />
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-dmMono">{label}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 text-[11px] text-zinc-300 border border-white/10 bg-zinc-900/60 rounded-full hover:bg-white/10 hover:text-zinc-100 transition-all duration-200 cursor-default"
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
              href="/resume.pdf"
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
