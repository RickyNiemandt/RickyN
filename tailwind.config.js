/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charm Systems creative-side brand palette
        canvas: "#000000", // Deep Black Canvas (primary background)
        accent: {
          DEFAULT: "#00FF66", // Electric Green (buttons, active states, CTAs)
          hover: "#33ff85",
        },
        highlight: {
          DEFAULT: "#8B5CF6", // Rich Purple (gradients, glows, trust badges)
        },
        heading: "#FFFFFF", // Pure White headings
        body: "#9CA3AF", // Slate Gray body copy (text-gray-400)
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        md: "12px",
      },
      boxShadow: {
        "accent-glow": "0 0 24px rgba(0, 255, 102, 0.45)",
        "purple-glow": "0 0 40px rgba(139, 92, 246, 0.35)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "33%": { transform: "translate3d(6%, -4%, 0) scale(1.15)" },
          "66%": { transform: "translate3d(-5%, 5%, 0) scale(0.95)" },
        },
        "drift-slow": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.1)" },
          "50%": { transform: "translate3d(-8%, 6%, 0) scale(0.9)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translate3d(0, 20px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
      },
      animation: {
        drift: "drift 22s ease-in-out infinite",
        "drift-slow": "drift-slow 30s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
