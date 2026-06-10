import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "projects", href: "#projects" },
  { label: "about", href: "#about" },
  { label: "contact", href: "#contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="px-4 sm:px-6 pt-4 pb-0">
      <div className="relative mx-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-5 py-3">

        {/* Logo */}
        <NavLink
          to="/"
          className="text-sm font-medium tracking-tight text-zinc-100 whitespace-nowrap"
        >
          <span className="mr-0.5">.mirireoluwa</span>
        </NavLink>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-7 text-[11px] text-zinc-400 tracking-[0.08em]">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={handleAnchorClick}
              className="hover:text-zinc-200 transition-colors duration-150"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Résumé CTA — desktop */}
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center rounded-md px-4 py-1.5 text-[10px] uppercase tracking-[0.14em] font-bold text-black hover:opacity-80 transition-opacity duration-150 whitespace-nowrap"
          style={{ backgroundColor: "#F5C22A" }}
        >
          résumé
        </a>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:border-white/20 transition-colors duration-150"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            /* X icon */
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 1.5L13.5 13.5M13.5 1.5L1.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            /* Hamburger icon */
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.75 1H14.25M0.75 6H14.25M0.75 11H14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute top-[calc(100%+8px)] left-0 right-0 z-40 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md py-4 px-5 flex flex-col gap-4"
            >
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={handleAnchorClick}
                  className="text-zinc-200 hover:text-white transition-colors text-[11px] tracking-[0.08em]"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors text-[11px] tracking-[0.08em]"
              >
                résumé ↗
              </a>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
