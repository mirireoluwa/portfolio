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
      "Getting a clear picture of what's happening in markets — especially Nigerian markets — means bouncing between five different apps before your day even starts. Bloomberg for global context, Nairametrics for NGX, Twitter to feel out the sentiment. It's exhausting and I just wanted one thing that told me what was actually going on.",
    process:
      "I started by thinking about what I actually needed in a 10-minute morning scan — macro context, local market movement, a feel for whether things were trending up or down. Then I looked at the tools I was already using and wrote down exactly where each one was failing me.\n\n" +
      "From there it was just building what I wished existed. The layout went through a few rounds — I tried tabs to separate global and NGX but that hid context I needed to see at the same time. Ended up with a split panel instead: indices and sentiment on the left, news feed on the right, watchlist tucked behind a login so it doesn't clutter the default view.",
    keyDecisions: [
      "Dark UI — financial data genuinely reads better on dark backgrounds. Less strain, better contrast for the charts. Kept the palette tight so the data itself does the visual work.",
      "Global and NGX in the same view — separating them into tabs created an artificial wall between two markets that actually move together. Nigerian investors care about both at the same time.",
      "Sentiment per story, not just overall — a blanket sentiment score doesn't tell you much. Tagging each story lets you see what's actually driving the mood, not just that the mood is negative.",
      "Watchlist behind a login — the unauthenticated experience is complete on its own. Nobody should have to create an account just to read the news.",
    ],
    outcome:
      "FinNews is live at fin-news.xyz. It's the one project where I've been my own user from day one — I actually use it every morning, which means it's constantly being tested against the original goal. So far it does what I built it to do.",
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
      "Most task tools either don't have enough structure — basic to-do lists you outgrow in a week — or have so much that you spend more time configuring than actually working. I wanted something in the middle. Something I could open and use immediately, but that could still hold a real project together.",
    process:
      "I wrote out how I actually manage my own work on paper, no tools. How I break things into tasks, how I decide what to work on first, where I lose the thread. That gave me a short list of things I genuinely needed: create tasks, track status, prioritize, schedule. Everything else was cut.\n\n" +
      "From there I tried a few different dashboard layouts before landing on one where status is the first thing you see — not due date, not project name. Because the question I ask most often isn't 'what's due today?', it's 'what am I actually doing right now?'",
    keyDecisions: [
      "Status as the primary axis — three clear states (pending, in progress, done) front and center. That's the thing I actually needed to see at a glance.",
      "Scheduling and priority in the creation flow — if it's buried in a detail view, nobody fills it in. Putting it upfront means it actually gets used.",
      "Single-user only, no teams — adding workspaces and permissions would've made this a different product. A personal task manager has different design needs than a team tool.",
      "Actually shipped it — deploying to a real URL forced me to solve problems a Figma file never would. Empty states, mobile behavior, data persistence. That's where the real design decisions happened.",
    ],
    outcome:
      "Live and in daily use. I also ended up applying the same thinking when I built a similar internal tool during my Airtel Nigeria internship, so it had some real-world impact outside just being a personal project.",
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
      "Food delivery apps in Nigeria are cluttered. You open the app and the first thing you see is promotions and banners — you have to scroll past all of that before you even get to restaurants. When you're hungry, that extra friction is genuinely annoying. I wanted to see what a version that actually prioritized the core job — find food, order it — would look like.",
    process:
      "I started by mapping the core flow: open app → find food → order placed. That's the job. Then I actually timed myself going through that same flow on three different competitor apps to see where the friction was.\n\n" +
      "Most of it came from two places — the number of screens before you reach a restaurant listing, and a checkout that kept asking for information that should've already been saved. I designed Chowdie around fixing those two things specifically, then wired up a Figma prototype that was realistic enough to actually feel the difference rather than just look at static screens.",
    keyDecisions: [
      "Warm, appetite-driven palette — cold and clinical doesn't make you want to eat. The amber and warm-white tones pull from hospitality design rather than tech, which felt more honest for a food product.",
      "Cart always visible — showing item count and subtotal in the nav at all times means you never have to open the cart just to check if something added correctly. That's a small thing that removes a lot of low-key anxiety.",
      "Checkout in two taps for returning users — store the details upfront. The checkout should be confirm → place, not fill everything in again every time.",
      "Prototype, not just mockup — static screens don't show how something feels to navigate. Wiring up the transitions and state changes in Figma meant the decisions could be tested by actually using them.",
    ],
    outcome:
      "The prototype is live and clickable on Figma. The main thing it demonstrates is how prototyping can be used to validate and sell design decisions before any code gets written — which is something I genuinely believe in as part of how design work should go.",
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
      "Most producer sites are either a bare link-in-bio with no personality or an overdesigned portfolio where the music is genuinely hard to find. I needed something that felt like me as an artist but also made it easy to actually get to the music and follow along.",
    process:
      "I started by thinking about the two types of people who'd land on the site — someone discovering Saintted for the first time, and someone coming back to find new music. Both needed to reach the streaming links quickly, but the first-time visitor needed some context first. Once I had that, the structure pretty much wrote itself: hero that sets the mood, a short about section, then the music.\n\n" +
      "I explored a few different hero directions in Framer before landing on full-bleed image with minimal overlay text. Atmosphere first, information second.",
    keyDecisions: [
      "Atmosphere before information — the hero image takes up the full screen with almost no text. You feel the aesthetic before you read anything. Music is emotional and the site should trigger that before your logical brain kicks in.",
      "Two sections, two jobs — the about section just has to be honest, it doesn't need to sell. The music section just has to make streaming easy, it doesn't need to explain anything. Keeping them separate let each one do its job without getting in the way.",
      "Framer over custom code — I wanted to iterate fast on motion, layout, and feel without getting stuck in implementation. For a brand site where feel matters more than features, that speed of iteration was the right call.",
      "Minimal copy throughout — every line went through multiple rewrites just to cut words without losing meaning. Short, precise copy signals confidence. Long artist bios usually don't.",
    ],
    outcome:
      "The site is live at saintted.com. It's also a useful example of how brand design and content strategy work together — the visual identity only holds because the copy is precise, and the copy only lands because the visual context is right.",
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
