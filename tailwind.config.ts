import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#087989",
          dark: "#06606E",
          soft: "#EAF8FA"
        },
        accent: "#2F6BFF",
        navy: "#0B213D",
        surface: "#F7F9FC",
        borderSoft: "#E4EAF1"
      },
      boxShadow: {
        card: "0 14px 42px rgba(15, 35, 64, 0.06)"
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "Noto Sans Arabic", "Tahoma", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
