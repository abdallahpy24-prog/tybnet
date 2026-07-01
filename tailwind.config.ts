import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00A9B7",
          dark: "#087989",
          soft: "#E9FBFD"
        },
        accent: "#1E7BF2",
        navy: "#102D55",
        surface: "#F4FBFD",
        borderSoft: "#DBEAF0"
      },
      boxShadow: {
        card: "0 18px 45px rgba(16, 45, 85, 0.08)"
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "Tajawal", "Noto Sans Arabic", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
