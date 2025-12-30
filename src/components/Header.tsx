import { NavLink } from "react-router-dom";

const navItems = [
  { label: "projects", href: "#projects", external: false },
  { label: "about", href: "#about", external: false },
  { label: "contact", href: "#contact", external: false },
];

export function Header() {
  const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const targetId = event.currentTarget.getAttribute("href")?.slice(1);
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (el) {
      event.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
      <NavLink to="/" className="text-sm font-medium tracking-tight text-zinc-100 whitespace-nowrap">
        <span className="mr-0.5 text-zinc-100">.</span>
        mirireoluwa
      </NavLink>

      <nav className="hidden md:flex items-center gap-6 text-[11px] text-zinc-400 tracking-[0.08em]">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={item.external ? undefined : handleAnchorClick}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
            className={
              item.label === "contact"
                ? "text-[#00ff77] hover:text-[#7bffb0] transition-colors"
                : "hover:text-zinc-200 transition-colors"
            }
          >
            {item.label}
          </a>
        ))}
      </nav>

      <button
        type="button"
        className="md:hidden inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200"
        aria-label="Open menu"
      >
        <span className="mr-1 text-zinc-400 text-xs">menu</span>
        <span className="h-[1px] w-4 bg-zinc-400 relative before:absolute before:-top-1 before:h-[1px] before:w-4 before:bg-zinc-400 after:absolute after:top-1 after:h-[1px] after:w-4 after:bg-zinc-400" />
      </button>
    </header>
  );
}


