/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "ui-sans-serif", "sans-serif"],
        spaceGrotesk: ["Space Grotesk", "system-ui", "ui-sans-serif", "sans-serif"],
        dmMono: ["DM Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
        // SF Pro is Apple's system font — can't be bundled as a webfont, so this
        // resolves to real San Francisco on Mac/iOS via the system stack, with
        // sane fallbacks elsewhere.
        sfPro: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        background: "#050509",
        surface: "#0b0b12",
      },
      borderRadius: {
        // Apple-ish radii: small (8), medium (12), large (20), pill (9999)
        "apple-sm": "8px",
        "apple-md": "12px",
        "apple-lg": "20px",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0,0,0,0.55)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
