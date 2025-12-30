/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "system-ui", "SF Pro Text", "ui-sans-serif", "sans-serif"],
        dmMono: ["DM Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
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
        glitchX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-10px)' },
          '40%, 80%': { transform: 'translateX(10px)' },
        },
        glitchY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '20%, 60%': { transform: 'translateY(-5px)' },
          '40%, 80%': { transform: 'translateY(5px)' },
        },
        noiseFloat: {
          '0%': { transform: 'translateX(10%) translateY(4%)' },
          '50%': { transform: 'translateX(14%) translateY(6%)' },
          '100%': { transform: 'translateX(18%) translateY(8%)' },
        },
      },
      animation: {
        glitchX: 'glitchX 1s infinite linear alternate',
        glitchY: 'glitchY 1s infinite linear alternate',
        noiseFloat: 'noiseFloat 40s linear infinite alternate',
      },
    },
  },
  plugins: [],
};
