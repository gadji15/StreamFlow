import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-roboto-mono)"],
      },
      colors: {
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary)",
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-light": "var(--surface-light)",
      },
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-card": "var(--gradient-card)",
      },
      animation: {
        "slide-up": "slideUp 0.5s ease forwards",
        "slide-right": "slideInRight 0.5s ease forwards",
        "scale-in": "scaleIn 0.5s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        card: "0 10px 20px rgba(0, 0, 0, 0.3)",
        glow: "0 0 10px rgba(123, 63, 228, 0.5)",
      },
      gridTemplateColumns: {
        "auto-fill-card": "repeat(auto-fill, minmax(180px, 1fr))",
        "auto-fill-card-lg": "repeat(auto-fill, minmax(240px, 1fr))",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};

export default config;