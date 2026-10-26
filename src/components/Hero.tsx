import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useProjects } from "../context/ProjectsContext";
import { defaultSite } from "../data/site";

const NAME = "mirireoluwa";

// Multilingual — nods to a Lagos designer working with people everywhere
const GREETINGS = ["hello", "hola", "bonjour", "olá", "こんにちは", "bawo"];

const EASE = [0.16, 1, 0.3, 1] as const;

function useLagosTime() {
  const [time, setTime] = useState(() => formatLagos());
  useEffect(() => {
    const t = window.setInterval(() => setTime(formatLagos()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  return time;
}

function formatLagos() {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return "";
  }
}

export function Hero() {
  const reduce = useReducedMotion();
  const { site } = useProjects();
  const roles = site.hero?.roles?.length ? site.hero.roles : defaultSite.hero!.roles;
  const [greeting, setGreeting] = useState(0);
  const [role, setRole] = useState(0);
  const lagosTime = useLagosTime();

  useEffect(() => {
    const t = window.setInterval(() => setGreeting((i) => (i + 1) % GREETINGS.length), 3200);
    return () => window.clearInterval(t);
  }, []);

  const count = roles.length;
  const active = role % count;
  useEffect(() => {
    if (count < 2 || reduce) return;
    const t = window.setTimeout(() => setRole((active + 1) % count), 3400);
    return () => window.clearTimeout(t);
  }, [active, count, reduce]);

  // Full-bleed: the `/1.1` in the width/margin calcs cancels the global
  // `body { zoom: 1.1 }` so 100vw resolves to the true viewport width.
  return (
    <section
      className="relative isolate -mt-2 ml-[calc(50%-50vw/1.1)] w-[calc(100vw/1.1)] overflow-hidden pb-10 pt-6 sm:pb-14 sm:pt-12"
      aria-label="Intro"
    >
      {/* Faint blueprint grid, masked to a soft ellipse behind the type */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 70% 70% at 40% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 40% 40%, black, transparent)",
        }}
      />

      {/* Column wrapper — mirrors the site's content column so the type lines up
          with the rest of the page even though the section is full-bleed */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {/* 1. Greeting on the left, status chips on the right */}
          <div className="hero-rise mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 sm:mb-8">
            <div className="h-5 overflow-hidden font-dmMono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={GREETINGS[greeting]}
                  className="block"
                  initial={{ y: reduce ? 0 : "110%" }}
                  animate={{ y: 0 }}
                  exit={{ y: reduce ? 0 : "-110%" }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {GREETINGS[greeting]} — i&apos;m
                </motion.span>
              </AnimatePresence>
            </div>
            <ul className="flex flex-wrap items-center gap-2 font-dmMono text-[11px] tracking-[0.06em] text-zinc-300">
              <li className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-sm bg-[#00ff77] opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-sm bg-[#00ff77]" />
                </span>
                available for new projects
              </li>
              <li className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-md">
                lagos, ng <span className="text-zinc-500">·</span>
                <span className="tabular-nums text-zinc-400">{lagosTime}</span>
              </li>
            </ul>
          </div>

          {/* 2. Name — CSS-driven per-letter reveal (.hero-letter in styles.css) */}
          <h1
            className="flex flex-wrap font-semibold leading-[0.82] tracking-tight text-zinc-50"
            style={{ fontSize: "clamp(2.9rem, 13.5vw, 9rem)" }}
            aria-label={NAME}
          >
            {NAME.split("").map((ch, i) => (
              <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span className="hero-letter" style={{ animationDelay: `${0.1 + i * 0.04}s` }}>
                  {ch}
                </span>
              </span>
            ))}
          </h1>

          {/* 3. Role — arrow and a single sliding title */}
          <div
            className="mt-6 flex items-center gap-3 sm:mt-8"
            style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.6rem)" }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[0.9em] w-[0.9em] shrink-0 text-zinc-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <div
              className="overflow-hidden font-semibold leading-[1.15] text-zinc-100"
              style={{ height: "1.4em" }}
              aria-live="polite"
            >
              <motion.div
                animate={{ y: reduce ? 0 : `-${active * 1.4}em` }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {roles.map((r, i) => (
                  <div key={`${r}-${i}`} className="flex items-center whitespace-nowrap" style={{ height: "1.4em" }}>
                    {reduce ? roles[active] : r}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* 4. Intro and actions */}
          <div className="hero-rise mt-10 sm:mt-14" style={{ animationDelay: "0.55s" }}>
            <p className="max-w-md text-sm leading-relaxed text-zinc-300 sm:text-base">
              i design products and build experiences that enhance the human life.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 border border-white/40 px-4 py-2.5 text-sm text-zinc-100 transition-colors duration-200 hover:bg-white hover:text-zinc-950"
              >
                see selected work
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </a>
              <a href="#contact" className="rounded-sm py-2 text-sm text-zinc-300 transition-colors hover:text-white">
                get in touch
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
