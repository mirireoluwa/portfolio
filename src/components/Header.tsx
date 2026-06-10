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
          className="hidden md:inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-[10px] uppercase tracking-[0.14em] text-zinc-300 hover:border-white/50 hover:text-white transition-colors duration-150 whitespace-nowrap"
        >
          résumé
        </a>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-zinc-200 gap-2"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          menu
          <span className="h-[1px] w-4 bg-zinc-100 relative before:absolute before:-top-1 before:h-[1px] before:w-4 before:bg-zinc-100 after:absolute after:top-1 after:h-[1px] after:w-4 after:bg-zinc-100" />
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
