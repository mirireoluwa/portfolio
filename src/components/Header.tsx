import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "projects", href: "#projects" },
  { label: "about", href: "#about" },
  { label: "contact", href: "#contact" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const onHome = pathname === "/";

  // Scroll-spy: brightens whichever nav item matches the section in view
  // (home page only — other pages simply have no matching ids).
  useEffect(() => {
    if (!onHome) {
      setActiveSection(null);
      return;
    }
    const ids = navItems.map((item) => item.href.slice(1));
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const lastId = ids[ids.length - 1];
    const atPageBottom = () =>
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    const observer = new IntersectionObserver(
      (entries) => {
        // The last section (contact) is short and sits at the end of the page,
        // so it can never reach the observer's centre band — force it active
        // once the page is scrolled to the bottom.
        if (atPageBottom()) {
          setActiveSection(lastId);
          return;
        }
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    targets.forEach((el) => observer.observe(el));

    const onScroll = () => {
      if (atPageBottom()) setActiveSection(lastId);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [onHome]);

  // Arriving on home with a #hash (e.g. from a project page) — scroll to it
  useEffect(() => {
    if (!onHome || !hash) return;
    const t = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [onHome, hash]);

  // Close the mobile menu on Escape and when the route changes
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const id = event.currentTarget.getAttribute("data-section");
    if (!id) return;
    event.preventDefault();
    setIsMenuOpen(false);
    if (!onHome) {
      // On a project page the section doesn't exist — go home, then scroll
      navigate({ pathname: "/", hash: `#${id}` });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id); // immediate feedback, don't wait for scroll-spy
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
          so the logo/links don't shift even though the bar now bleeds edge to edge */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between gap-6">
        {/* Logo */}
        <NavLink
          to="/"
          className={`rounded-sm py-2 text-sm font-medium tracking-tight text-zinc-100 whitespace-nowrap ${focusRing}`}
        >
          <span className="mr-0.5">.mirireoluwa</span>
        </NavLink>

        {/* Desktop nav — plain text, no container */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-sm">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <a
                key={item.label}
                href={`/${item.href}`}
                data-section={item.href.slice(1)}
                onClick={handleAnchorClick}
                aria-current={isActive ? "location" : undefined}
                className={`rounded-sm py-2 transition-colors duration-200 ${focusRing} ${
                  isActive ? "text-zinc-50" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Mobile menu toggle — plain icon, no box */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`md:hidden -mr-3 inline-flex h-11 w-11 items-center justify-center rounded-md text-zinc-300 transition-colors duration-150 hover:text-white ${focusRing}`}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
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
            id="mobile-nav"
            aria-label="Primary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative md:hidden overflow-hidden"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="flex flex-col pt-3">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.slice(1);
                  return (
                    <a
                      key={item.label}
                      href={`/${item.href}`}
                      data-section={item.href.slice(1)}
                      onClick={handleAnchorClick}
                      aria-current={isActive ? "location" : undefined}
                      className={`block rounded-sm py-3 text-base transition-colors ${focusRing} ${
                        isActive ? "text-zinc-50" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
