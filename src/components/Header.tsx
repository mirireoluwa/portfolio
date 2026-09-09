import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useResume } from "../context/ResumeContext";

const navItems = [
  { label: "projects", href: "#projects" },
  { label: "about", href: "#about" },
  { label: "contact", href: "#contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { resumeUrl } = useResume();

  // Scroll-spy: brightens whichever nav item matches the section in view
  // (home page only — other pages simply have no matching ids).
  useEffect(() => {
    const ids = navItems.map((item) => item.href.slice(1));
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute("href");
    if (!href?.startsWith("#")) return;
    const el = document.getElementById(href.slice(1));
    if (el) {
      event.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="relative w-full py-5">
      {/* Vignette — soft fade so scrolling content reads as receding beneath the nav, not shadow-cut.
          Now spans the true viewport width since the header itself is full-bleed. */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-6 h-28"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,5,9,0.92) 0%, rgba(5,5,9,0.55) 55%, transparent 100%)",
        }}
        aria-hidden
      />
      {/* Content stays exactly where it was — same max-width + padding as before,
          so the logo/links/résumé don't shift even though the bar now bleeds edge to edge */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between gap-6">
        {/* Logo */}
        <NavLink
          to="/"
          className="text-sm font-medium tracking-tight text-zinc-100 whitespace-nowrap"
        >
          <span className="mr-0.5">.mirireoluwa</span>
        </NavLink>

        {/* Desktop nav — plain text, no container */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={handleAnchorClick}
                className={`transition-colors duration-200 ${
                  isActive ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
          >
            résumé ↗
          </a>
        </nav>

        {/* Mobile menu toggle — plain icon, no box */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden inline-flex items-center justify-center text-zinc-300 hover:text-white transition-colors duration-150"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            /* X icon */
            <svg width="17" height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 1.5L13.5 13.5M13.5 1.5L1.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            /* Hamburger icon */
            <svg width="17" height="14" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.75 1H14.25M0.75 6H14.25M0.75 11H14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu — expands inline below the row, same accordion pattern as
          the Experience timeline, so it stays part of the page instead of a
          floating overlay box */}
      <AnimatePresence initial={false}>
        {isMenuOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative md:hidden overflow-hidden"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="flex flex-col gap-5 pt-6">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.slice(1);
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={handleAnchorClick}
                      className={`text-base transition-colors ${
                        isActive ? "text-zinc-50" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  résumé ↗
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
