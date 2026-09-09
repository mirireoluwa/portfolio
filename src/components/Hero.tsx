import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

const NAME = "mirireoluwa";

// Multilingual — nods to a Lagos designer working with people everywhere
const GREETINGS = ["hello", "hola", "bonjour", "olá", "こんにちは", "bawo"];

const ROLES = ["a product designer", "a sound designer"];

const EASE = [0.16, 1, 0.3, 1] as const;

/** A glass pill that drifts with the pointer (parallax) and floats gently on its own. */
function FloatChip({
  mvX,
  mvY,
  depth,
  delay,
  floatDur,
  className,
  tint = "glass",
  children,
}: {
  mvX: MotionValue<number>;
  mvY: MotionValue<number>;
  depth: number;
  delay: number;
  floatDur: number;
  className?: string;
  tint?: "glass" | "dark";
  children: ReactNode;
}) {
  const x = useTransform(mvX, (v) => v * depth);
  const y = useTransform(mvY, (v) => v * depth);

  return (
    <div
      className={`pointer-events-none absolute z-20 hero-chip-in ${className ?? ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* pointer parallax */}
      <motion.div style={{ x, y }}>
        {/* idle float (CSS, so it survives rAF throttling) */}
        <div
          className="hero-chip-float"
          style={{ "--float-dur": `${floatDur}s` } as CSSProperties}
        >
          <div
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 px-3 py-2 font-dmMono text-[11px] tracking-[0.06em] text-zinc-300 shadow-[0_16px_50px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md ${
              tint === "dark" ? "bg-zinc-950/75" : "bg-white/[0.04]"
            }`}
          >
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PulseDot({ color = "#00ff77" }: { color?: string }) {
  return (
    <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-sm opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex h-1.5 w-1.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

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
  const ref = useRef<HTMLElement>(null);

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const sx = useSpring(mvX, { stiffness: 50, damping: 18, mass: 0.4 });
  const sy = useSpring(mvY, { stiffness: 50, damping: 18, mass: 0.4 });

  const glowX = useTransform(sx, (v) => `${50 + v * 26}%`);
  const glowY = useTransform(sy, (v) => `${46 + v * 26}%`);
  const glow = useMotionTemplate`radial-gradient(560px circle at ${glowX} ${glowY}, rgba(76,179,255,0.10), transparent 70%)`;

  const [greeting, setGreeting] = useState(0);
  const [role, setRole] = useState(0);
  const lagosTime = useLagosTime();

  useEffect(() => {
    const t = window.setInterval(
      () => setGreeting((i) => (i + 1) % GREETINGS.length),
      3200
    );
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const t = window.setInterval(
      () => setRole((i) => (i + 1) % ROLES.length),
      3400
    );
    return () => window.clearInterval(t);
  }, []);

  const handlePointer = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mvX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    mvY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  const resetPointer = () => {
    mvX.set(0);
    mvY.set(0);
  };

  // Full-bleed: the `/1.1` in the width/margin calcs cancels the global
  // `body { zoom: 1.1 }` so 100vw resolves to the true viewport width.
  return (
    <section
      ref={ref}
      onPointerMove={reduce ? undefined : handlePointer}
      onPointerLeave={resetPointer}
      className="relative isolate -mt-2 ml-[calc(50%-50vw/1.1)] flex w-[calc(100vw/1.1)] flex-col justify-center overflow-hidden pb-4 pt-4 sm:pb-6 sm:pt-8 min-h-[68vh] sm:min-h-[72vh]"
      aria-label="Intro"
    >
      {/* Pointer-tracking accent glow */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: glow }}
        />
      )}

      {/* Faint blueprint grid, masked to a soft ellipse behind the type */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 45% 42%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 45% 42%, black, transparent)",
        }}
      />

      {/* Column wrapper — mirrors the site's content column so the type lines up
          with the rest of the page even though the section is full-bleed */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
      {/* Floating chips — desktop only; mobile gets a compact static row below */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
        <FloatChip
          mvX={sx}
          mvY={sy}
          depth={30}
          delay={0.55}
          floatDur={6}
          className="right-[4%] top-[13%] lg:right-[6%]"
        >
          <PulseDot />
          available for new projects
        </FloatChip>

        <FloatChip
          mvX={sx}
          mvY={sy}
          depth={20}
          delay={0.8}
          floatDur={7.5}
          tint="dark"
          className="bottom-[19%] right-[5%] lg:right-[7%]"
        >
          lagos, ng
          <span className="text-zinc-600">·</span>
          <span className="tabular-nums text-zinc-400">{lagosTime}</span>
        </FloatChip>

        <FloatChip
          mvX={sx}
          mvY={sy}
          depth={38}
          delay={0.95}
          floatDur={6.8}
          className="bottom-[7%] right-[16%] lg:right-[22%]"
        >
          <span className="text-zinc-500">↳</span>
          producing as saintted
        </FloatChip>
      </div>

      {/* ── Type block ── */}
      <div className="relative mx-auto max-w-5xl">
        {/* Cycling multilingual greeting */}
        <div className="hero-rise mb-4 h-5 overflow-hidden font-dmMono text-[11px] uppercase tracking-[0.22em] text-zinc-500 sm:mb-6">
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

        {/* Oversized kinetic wordmark — CSS-driven per-letter reveal (see
            .hero-letter in styles.css) so it can't be stranded by rAF throttling */}
        <h1
          className="flex flex-wrap font-semibold leading-[0.82] tracking-tight text-zinc-50"
          style={{ fontSize: "clamp(2.9rem, 13.5vw, 9rem)" }}
          aria-label={NAME}
        >
          {NAME.split("").map((ch, i) => (
            <span
              key={i}
              aria-hidden
              className="inline-block overflow-hidden pb-[0.08em] align-bottom"
            >
              <span
                className="hero-letter"
                style={{ animationDelay: `${0.1 + i * 0.04}s` }}
              >
                {ch}
              </span>
            </span>
          ))}
        </h1>

        {/* Rotating role — masked slide */}
        <div className="mt-6 flex items-start gap-3 sm:mt-8">
          <span className="shrink-0 translate-y-[0.35em] font-dmMono text-[11px] uppercase tracking-[0.22em] text-zinc-600">
            →
          </span>
          <div
            className="overflow-hidden font-semibold leading-[1.15] text-zinc-100"
            style={{ fontSize: "clamp(1.4rem, 4.6vw, 2.6rem)", height: "1.4em" }}
            aria-live="polite"
          >
            {/* Slot-reel: the whole stack slides; only one row shows through */}
            <motion.div
              animate={{ y: reduce ? 0 : `-${role * 1.4}em` }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {ROLES.map((r) => (
                <div
                  key={r}
                  className="flex items-center whitespace-nowrap"
                  style={{ height: "1.4em" }}
                >
                  {reduce ? ROLES[role] : r}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Supporting line */}
        <p
          className="hero-rise mt-7 max-w-md text-sm leading-relaxed text-zinc-400 sm:mt-9"
          style={{ animationDelay: "0.55s" }}
        >
          i design products and build experiences that enhance the human life.
        </p>

        {/* CTAs */}
        <div
          className="hero-rise mt-7 flex flex-wrap items-center gap-x-5 gap-y-3"
          style={{ animationDelay: "0.7s" }}
        >
          <a
            href="#projects"
            className="group inline-flex items-center gap-2 border border-white/40 px-4 py-2 text-sm text-zinc-200 transition-colors duration-200 hover:bg-white hover:text-zinc-950"
          >
            see selected work
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </a>
          <a
            href="#contact"
            className="text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-300"
          >
            get in touch
          </a>
        </div>

        {/* Mobile-only compact status row (replaces floating chips) */}
        <div
          className="hero-rise mt-8 flex flex-wrap gap-2 sm:hidden"
          style={{ animationDelay: "0.85s" }}
        >
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-dmMono text-[10px] tracking-[0.06em] text-zinc-400">
            <PulseDot />
            available for work
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-dmMono text-[10px] tracking-[0.06em] text-zinc-400">
            lagos, ng
            <span className="text-zinc-600">·</span>
            <span className="tabular-nums">{lagosTime}</span>
          </span>
        </div>
      </div>
      </div>
    </section>
  );
}
