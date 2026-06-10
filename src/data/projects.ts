import type { Project } from "../types/project";

export type { Project, ProjectCategory } from "../types/project";

/** Bundled fallback when CMS (Redis) has no data — also used to seed the admin "restore defaults" action. */
export const defaultProjects: Project[] = [
  {
    slug: "finnews",
    title: "finnews",
    year: "2026",
    category: "Product Design",
    role: "Product Design & Development",
    summary:
      "FinNews is a market intelligence product built around a simple idea: your daily financial briefing should feel calm, scannable, and actually useful—not like drowning in headlines.\n\n" +
      "It combines global market context with Nigerian Exchange (NGX) coverage, sentiment signals, and a personal watchlist so you can follow what matters without jumping between tabs.",
    description:
      "I started FinNews because I wanted one place to understand how markets were moving—globally and locally—without opening five different apps. The goal was a briefing-style experience: enough depth to be informed, enough structure to read in a few minutes.\n\n" +
      "The dashboard brings together a live news feed, market sentiment, story-level sentiment breakdowns, and index visuals in a dark, data-forward UI. Global headlines sit alongside NGX-focused coverage so Nigerian market context isn't an afterthought.\n\n" +
      "Signed-in users can maintain a watchlist and track the stories and instruments they care about. Sessions use a secure token stored on the device, keeping the flow lightweight while still supporting a personalized feed.\n\n" +
      "I owned this end to end—product direction, interface design, and implementation—including how information is grouped on screen, how dense the data should feel, and how the experience should read on both desktop and mobile.",
    problem:
      "Financial information in Nigeria is fragmented. Getting a complete market picture means bouncing between Bloomberg for global context, Nairametrics for NGX data, and Twitter for sentiment—a workflow that's slow, noisy, and exhausting for anyone who just wants to stay informed before their day starts.",
    process:
      "I mapped out what a 10-minute morning briefing actually needs: a macro view, relevant local market movement, and a sense of whether sentiment is shifting. From there I audited five existing products—Bloomberg, CNBC Markets, Nairametrics, TradingView, and Robinhood—noting where each one failed the \"calm and scannable\" test.\n\n" +
      "The layout went through three iterations. The first version separated global and NGX into tabs, which meant context was never visible at the same time. The second put everything on one long scroll—too dense. The final design uses a split-panel dashboard: macro indices and sentiment left, news feed right, with the watchlist tucked behind a user session so it doesn't clutter the default view.",
    keyDecisions: [
      "Dark, data-forward aesthetic — financial data reads better against dark backgrounds (reduced eye strain during extended sessions, better contrast for charts). Kept the palette restrained: one accent color per data category.",
      "Combined global + NGX in a single view — the core insight was that Nigerian investors care about both simultaneously. Separating them into tabs created false isolation between connected markets.",
      "Story-level sentiment, not just market-wide — aggregate sentiment scores are noise. Tagging sentiment per story lets users quickly identify which specific events are driving mood, not just that mood is negative.",
      "Watchlist behind auth — keeping it optional and session-gated means the unauthenticated experience is still complete. Users aren't forced to sign up to get value.",
    ],
    outcome:
      "FinNews is live at fin-news.xyz and in active daily use. It's the only product in my portfolio where I validated the full loop—defined the problem myself, designed the solution, built it, and then used it every day to test whether it actually solved what I set out to fix. It does.",
    links: [
      {
        label: "visit FinNews",
        href: "https://fin-news.xyz",
      },
    ],
    tags: ["product design", "information architecture", "dashboard UX", "fintech", "web app"],
    accentColor: "#4CB3FF",
    accentTextColor: "#0b1421",
    snapshots: [
      {
        src: "/finnews-landing.png",
        alt: "FinNews landing — daily financial briefing and market intelligence hero",
      },
      {
        src: "/finnews-dashboard.png",
        alt: "FinNews dashboard — global markets, sentiment, and news feed",
      },
    ],
  },
  {
    slug: "airflow",
    title: "airflow",
    year: "2025",
    category: "Product Design",
    role: "Product Design & Front-End Development",
    summary:
      "Airflow is a task and project management app designed to keep planning, execution, and status in one place—without the clutter of heavier productivity tools.\n\n" +
      "The focus is clarity: see what you're working on, what's next, and what's done, with enough structure to stay organized day to day.",
    description:
      "Airflow began as a personal productivity experiment. I wanted a workspace that supported real project workflows—breaking work into tasks, scheduling what matters, and tracking progress—without feeling overwhelming to set up or maintain.\n\n" +
      "The interface centers on a streamlined dashboard where users can create and organize tasks, set priorities, and update status as work moves forward. Scheduling and prioritization are built into the core flow so planning and doing stay connected instead of living in separate tools.\n\n" +
      "On the design side, I focused on hierarchy, spacing, and readable states (pending, in progress, complete) so the app stays scannable at a glance. On the engineering side, I built the front end with React and Tailwind CSS, emphasizing responsive layout and fast interactions.\n\n" +
      "The app is deployed for live use, which pushed me to think about performance, reliable access, and a consistent experience across screen sizes—not just a static mockup.",
    problem:
      "Most productivity tools fail one of two ways: they're too simple to support real project workflows (basic to-do lists), or so feature-heavy they require significant setup before you can do any actual work (Notion, Linear, Jira). I needed something in between—structured enough to manage multi-step projects, lightweight enough to open and use in under a minute.",
    process:
      "I started by writing down my own productivity workflow on paper: how I actually break projects into tasks, how I decide what to work on next, and where I lose track. This gave me a minimal feature set: task creation, status tracking, prioritization, and scheduling—nothing else.\n\n" +
      "I wireframed three dashboard layouts before landing on the current one. The key decision was making status (not project or due date) the primary visual axis—because the question I ask most often isn't 'what's due?' but 'what am I actually doing right now?'",
    keyDecisions: [
      "Status as the primary visual language — three clear states (pending, in progress, complete) with distinct visual weight mean you can read the dashboard's health in under a second without opening anything.",
      "Scheduling and prioritization as core, not addons — putting these in the main creation flow rather than burying them in detail views means they actually get used. Friction at capture time kills the habit.",
      "No workspaces, no teams — keeping Airflow strictly personal removes the overhead of permissions and sharing, which was the biggest source of complexity in tools I tried. A single user's task list needs different design than a team's.",
      "Built and deployed rather than prototyped — shipping to a real URL forced me to solve problems a mockup wouldn't surface: performance on mobile, persistence across sessions, edge cases with empty states.",
    ],
    outcome:
      "Airflow is live and in active personal use. Having built and shipped it myself means every design decision I made was immediately testable—I used the app to plan the app. It also became the foundation for a similar internal tool I designed during my Airtel Nigeria internship.",
    links: [
      {
        label: "visit Airflow",
        href: "https://airflow-rust.vercel.app",
      },
    ],
    tags: ["product design", "interaction design", "productivity", "web app"],
    accentColor: "#FF4949",
    accentTextColor: "#FFFFFF",
    snapshots: [
      {
        src: "/airflow-dasboard.jpeg",
        alt: "Airflow dashboard overview",
      },
      {
        src: "/airflow-splashscreen.jpeg",
        alt: "Airflow splash screen",
      },
    ],
  },
  {
    slug: "chowdie",
    title: "chowdie",
    year: "2025",
    category: "UX/Product Design",
    role: "UX Design, Interaction Design, Prototyping",
    summary:
      "Chowdie is a high-fidelity Figma prototype for a mobile food-ordering experience—from discovery and menu browsing through checkout.\n\n" +
      "It was built to test layout, navigation, and key user flows before any development work, so design decisions could be validated early with a realistic, interactive preview.",
    description:
      "Chowdie explores what a focused food app could feel like on mobile: quick to understand, visually warm, and straightforward to move through when you're hungry and in a hurry.\n\n" +
      "I designed the full UI system in Figma—typography, color, components, and screen layouts—then wired the prototype to show how users move between discovery, item selection, cart, and checkout. The hero and checkout screens in the snapshots reflect two critical moments: first impression and payment confidence.\n\n" +
      "A big part of the work was flow design: reducing friction between 'I want food' and 'order placed,' while keeping enough visual feedback so users always know where they are in the journey. I used Figma's prototyping tools to simulate transitions, taps, and state changes stakeholders could click through themselves.\n\n" +
      "Because this is a design-only deliverable, the outcome is a shareable prototype that communicates intent clearly—useful for feedback, iteration, and alignment before engineering starts.",
    problem:
      "Existing food delivery apps in Nigeria—Bolt Food, Glovo, Chowdeck—pack their home screens with promotions, banners, and categories until the actual ordering task feels buried. When you're hungry, every extra tap is friction. I wanted to explore what the experience looks like when it's designed around the user's job-to-be-done (get food, fast) rather than the platform's marketing goals.",
    process:
      "I started by mapping the core user journey: hunger → browse → select → add to cart → checkout → confirmation. Then I audited three competitor apps, timing how many taps each required from launch to order placed. The range was 8–14 taps.\n\n" +
      "From the audit I identified three friction points: (1) too many promotional interruptions before reaching restaurant listings, (2) unclear cart state—users couldn't tell how much they'd added without opening the cart, (3) checkout flows that re-asked for information already saved.\n\n" +
      "I designed Chowdie's screens to address all three, then wired a prototype in Figma with realistic transitions so stakeholders could experience the difference rather than read about it.",
    keyDecisions: [
      "Warm, appetite-driven color palette — food apps that feel clinical or overly technical fail to trigger appetite. Chowdie's amber and warm-white palette is a deliberate trust signal borrowed from hospitality design, not tech.",
      "Persistent cart summary in the navigation bar — showing item count and subtotal at all times eliminates the 'did that add correctly?' anxiety that causes users to open and close the cart repeatedly.",
      "Two-tap checkout for returning users — storing payment and delivery info upfront so the checkout flow is confirm → place, not fill in → fill in → confirm → place. Reduces the most cognitively loaded moment in the flow.",
      "Discovery before promotions — restaurants and categories appear before any promotional banners. Promotions exist but are contextual (inside a restaurant view) not a gatekeeper to the browsing experience.",
    ],
    outcome:
      "The prototype is live and clickable on Figma. The audit-to-design process brought the theoretical tap count from competitor averages of 8–14 down to 5 taps from launch to order placed. As a design-only deliverable it demonstrates how prototyping can be used to validate and sell design decisions before a single line of code is written.",
    tags: ["mobile UX", "interaction design", "user flows", "prototyping", "figma"],
    links: [
      {
        label: "view prototype",
        href: "https://www.figma.com/proto/lH04nyFikRTKjGHcRXFAOo/Chowdie?page-id=0%3A1&node-id=1-666&viewport=222%2C200%2C0.2&t=PUg0xBvLlJYwiJVA-1&scaling=min-zoom&content-scaling=fixed",
      },
    ],
    accentColor: "#FFA100",
    accentTextColor: "#000000",
    snapshots: [
      {
        src: "/chowdie-hero.png",
        alt: "Chowdie landing hero",
      },
      {
        src: "/chowdie-checkout.png",
        alt: "Chowdie checkout flow",
      },
    ],
  },
  {
    slug: "saintted",
    title: "saintted",
    year: "2025",
    category: "Brand + Web Design",
    role: "Brand Design, Web Design & Development",
    summary:
      "Saintted is a personal music and artist portfolio for my work as a producer—showcasing releases, platforms, and creative identity in one immersive site.\n\n" +
      "Built in Framer, it prioritizes atmosphere and simplicity so the music stays central while still making it easy to listen, follow, and explore.",
    description:
      "As Saintted, I produce music in Ableton and release work that sits at the intersection of emotion, identity, and growth. This site is the home for that practice: a place where listeners can understand who I am as an artist and get to the music quickly.\n\n" +
      "The layout leads with mood and presence—hero imagery, concise copy, and clear calls to action—before guiding visitors to latest tracks, streaming platforms, and social profiles. The about and music sections (shown in the snapshots) separate storytelling from catalog so each page has a clear job.\n\n" +
      "I chose Framer to move fast on visual polish—motion, typography, and responsive behavior—without sacrificing the editorial feel I wanted. That let me iterate on layout and tone until the site felt like the music itself: intentional, minimal, and personal.\n\n" +
      "The result is a portfolio that works as both a creative statement and a practical hub for fans—easy to share, easy to update, and focused on connection rather than clutter.",
    problem:
      "Independent music producers need a presence that does two things at once: communicate creative identity (who you are, what you sound like, why someone should care) and convert that interest into action (stream this, follow me here). Most producer sites fail at one or both—either they're generic link-in-bio pages with no personality, or they're so visually heavy that the music itself gets buried.",
    process:
      "I started by defining two user types: someone discovering Saintted for the first time, and someone returning to find new music. Both need to reach the streaming links in under two clicks, but the first-time visitor needs emotional context first.\n\n" +
      "The site structure became: hero (mood, name, one-line identity) → about (story, just enough) → music (latest releases + streaming platform links). I explored four hero directions in Framer before landing on the current full-bleed image with minimal overlay text—atmosphere first, information second.",
    keyDecisions: [
      "Atmosphere before information — the hero image is full-bleed with minimal text overlay. Visitors feel the aesthetic before they read anything. This is intentional: music is emotional, and the site needs to trigger an emotional response before the rational brain starts evaluating.",
      "Two-section structure (story + catalog) — separating the artist narrative from the music catalog gives each section a clear job. The about section doesn't have to sell; it just has to be honest. The music section doesn't have to explain; it just has to make streaming easy.",
      "Framer over custom code — choosing a tool that let me iterate on motion and layout visually meant I could test ten layout variations in the time it would take to code two. For a brand site where feel matters more than features, that speed of iteration was the right call.",
      "Minimal copy throughout — every line of text on the site went through multiple rewrites to reduce word count while keeping meaning. Verbose artist bios signal insecurity; short, precise ones signal confidence.",
    ],
    outcome:
      "The site is live and serves as the primary hub for the Saintted project. It's a case study in how brand design and content strategy compound each other—the visual identity only works because the copy is precise, and the copy only lands because the visual context is right.",
    tags: ["brand design", "web design", "visual identity", "content strategy"],
    links: [
      {
        label: "visit saintted",
        href: "https://saintted.com",
      },
    ],
    accentColor: "#2E3538",
    accentTextColor: "#B3FFCB",
    snapshots: [
      {
        src: "/saintted-hero.jpeg",
        alt: "Saintted hero section",
      },
      {
        src: "/saintted-about-music.jpeg",
        alt: "Saintted about and music section",
      },
    ],
  },
];

/** @deprecated Use `defaultProjects` or `useProjects()` from context */
export const projects = defaultProjects;
