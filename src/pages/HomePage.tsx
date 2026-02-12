import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { projects } from "../data/projects";

const heroPhrases = [
  "an ultra-creative", 
  "an artist", 
  "a producer", 
  "a designer",
  "a visionary",
  "a genius",
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

const fuzzyGlitchVariants: any = {
  initial: { opacity: 1, x: 0, y: 0 },
  glitch1: {
    opacity: [1, 0.8, 1, 0.7, 1],
    x: [0, -2, 2, -1, 0],
    y: [0, 1, -1, 2, 0],
    transition: { duration: 0.15, ease: "easeInOut" },
  },
  glitch2: {
    opacity: [1, 0.7, 1, 0.6, 1],
    x: [0, 3, -3, 1, 0],
    y: [0, -2, 2, -1, 0],
    transition: { duration: 0.15, ease: "easeInOut" },
  },
};

export function HomePage() {
  const [activePhrase, setActivePhrase] = useState(0);
  const [activeGreeting, setActiveGreeting] = useState(0);
  const [glitchPhase, setGlitchPhase] = useState<"idle" | "glitch1" | "glitch2">("idle");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const phraseHeightRef = useRef<number>(0);
  const phraseContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    let glitchTimeout: ReturnType<typeof setTimeout>;
    let glitchPhaseTimeout1: ReturnType<typeof setTimeout>;
    let glitchPhaseTimeout2: ReturnType<typeof setTimeout>;

    const startGlitchCycle = () => {
      const glitchDelay = 10000 + Math.random() * 10000; // 10-20 seconds
      glitchTimeout = setTimeout(() => {
        setGlitchPhase("glitch1");
        glitchPhaseTimeout1 = setTimeout(() => {
          setGlitchPhase("glitch2");
          glitchPhaseTimeout2 = setTimeout(() => {
            setGlitchPhase("idle");
            startGlitchCycle();
          }, 2000); // increased glitch2 duration from 600 to 1000
        }, 2000); // increased glitch1 duration from 600 to 1000
      }, glitchDelay);
    };

    startGlitchCycle();

    return () => {
      clearTimeout(glitchTimeout);
      clearTimeout(glitchPhaseTimeout1);
      clearTimeout(glitchPhaseTimeout2);
    };
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

        {/* Hero Heading and Phrases - Grouped together */}
        <div className="space-y-0 sm:space-y-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight text-zinc-50 flex items-center gap-2">
            <span className="flex items-center relative" style={{ width: "max-content" }}>
              i&apos;m&nbsp;
              {glitchPhase === "idle" && (
                <motion.span
                  key="mirireoluwa"
                  initial="initial"
                  animate="initial"
                  exit="initial"
                  variants={fuzzyGlitchVariants}
                  className="relative font-semibold"
                  style={{ color: "#f0f0f0" }}
                >
                  mirireoluwa
                </motion.span>
              )}
              {glitchPhase === "glitch1" && (
                <motion.a
                  key="saintted"
                  href="https://saintted.framer.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative font-semibold"
                  initial="initial"
                  animate="glitch1"
                  exit="initial"
                  variants={fuzzyGlitchVariants}
                  style={{ display: "inline-block", color: "#FF4B63" }}
                >
                  saintted
                </motion.a>
              )}
              {glitchPhase === "glitch2" && (
                <motion.span
                  key="mirireoluwa-glitch"
                  initial="initial"
                  animate="glitch2"
                  exit="initial"
                  variants={fuzzyGlitchVariants}
                  className="relative font-semibold"
                  style={{ color: "#f0f0f0" }}
                >
                  mirireoluwa
                </motion.span>
              )}
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

        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              to={`/projects/${project.slug}`}
              key={project.slug}
              className="group relative rounded-lg overflow-hidden border border-white/10 bg-surface/80 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div
                className="relative p-4 pb-3"
                style={{ backgroundColor: project.accentColor, color: project.accentTextColor }}
              >
                <div className="flex items-center justify-between text-[10px] font-dmMono lowercase tracking-[0.12em]">
                  <span>{project.year}</span>
                  <span>{project.category}</span>
                </div>
                <div
                  className="mt-3 h-px opacity-30"
                  style={{ backgroundColor: project.accentTextColor }}
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold lowercase">{project.title}</h3>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-xs">
                    →
                  </span>
                </div>
              </div>
              <div className="relative flex-1 bg-zinc-900">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(0,0,0,0.18)_25%,_transparent_25%,_transparent_50%,_rgba(0,0,0,0.18)_50%,_rgba(0,0,0,0.18)_75%,_transparent_75%,_transparent)] bg-[length:6px_6px] opacity-30" />
              </div>
            </Link>
          ))}
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
            I’m a Computer Science student with a strong interest in design, music, and building meaningful digital experiences. I work at the intersection of technology, creativity, and problem-solving—exploring UI/UX, product thinking, and emerging technologies. Beyond tech, I create and release music under the name{" "}
              <a
                href="https://saintted.framer.website"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
                style={{ color: "#FF4B63" }}
              >
                Saintted
              </a>
              , where I express ideas around emotion, identity, and growth through sound.
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
          {/* IT Intern - Airtel Nigeria */}
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
                  <h3 className="text-2xl font-semibold mb-2">IT Intern</h3>
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
                    <span className="flex-1">Assisted in troubleshooting and resolving issues with USSD services, improving service reliability and customer experience for millions of daily users.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Contributed to the design and implementation of a new USSD service, enabling more efficient connectivity and communication.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Contributed to the development of a python application that organizes raw data dumps into structured files, improving readability and accessibility.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Designed and developed a project & task management application with features for projects, tasks, checklists, and dependencies, enabling potential use across multiple Airtel Nigeria departments.</span>
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
                  <h3 className="text-2xl font-semibold mb-2">UI/UX Design and Frontend Development Intern</h3>
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
                    <span className="flex-1">Designed intuitive user interfaces for the website of a non-profit organization, enhancing its online presence and user engagement through Figma prototypes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Worked on the design team to conceptualize and create user interface designs and interactive prototypes using Figma for a wealth management application tailored to high-net-worth individuals, facilitating efficient management of assets, investments, and liabilities.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1">Developed and deployed responsive websites using the React framework, JavaScript (TypeScript), and TailwindCSS, ensuring seamless user experiences across devices and platforms via Vercel.</span>
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
                  <h3 className="text-2xl font-semibold mb-2">Graphics Design Intern</h3>
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
                    <span className="flex-1">Collaborated with graphic designers to develop promotional vector graphics for the organization's social media platforms, leveraging Adobe Illustrator to create visually engaging and brand-consistent content.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
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

          <div className="flex flex-row items-center gap-4">
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
          </div>
        </div>
      </section>
    </div>
  );
}
