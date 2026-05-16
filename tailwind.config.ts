import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./stores/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070B12",
        panel: "rgba(13, 18, 31, 0.72)",
        line: "rgba(255, 255, 255, 0.12)",
        mint: "#4EE6A8",
        amber: "#FFB547",
        coral: "#FF6B6B",
        skyglow: "#61C6FF"
      },
      boxShadow: {
        glow: "0 18px 70px rgba(78, 230, 168, 0.18)",
        panel: "0 18px 60px rgba(2, 6, 23, 0.28)"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"]
      },
      keyframes: {
        "soft-pulse": {
          "0%, 100%": { opacity: "0.72" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
