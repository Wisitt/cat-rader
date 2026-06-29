import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#F8FAF7",
        foreground: "#142733",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#142733",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#142733",
        },
        muted: {
          DEFAULT: "#F6F3EE",
          foreground: "#687280",
        },
        accent: {
          DEFAULT: "#E4F5EF",
          foreground: "#075E66",
        },
        input: "#D8E4E0",
        ring: "#0F766E",
        destructive: "#EF4444",
        "warm-bg": "#F6F3EE",
        surface: "#FFFFFF",
        border: "#DFE8E5",
        "text-strong": "#142733",
        "text-muted": "#687280",
        primary: {
          DEFAULT: "#0F766E",
          deep: "#075E66",
          dark: "#0B5F59",
          foreground: "#FFFFFF",
        },
        mint: "#DDF7EC",
        amber: "#F59E0B",
        "emergency-red": "#EF4444",
        "reunited-green": "#22C55E",
        "match-purple": "#8B5CF6",
        "soft-blue": "#3B82F6",
        "gray-unverified": "#9CA3AF",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "inner-sm": "inset 0 1px 0 rgb(255 255 255 / 0.75)",
        soft: "0 1px 2px rgb(20 39 51 / 0.04), 0 10px 30px rgb(20 39 51 / 0.05)",
        card: "0 1px 2px rgb(20 39 51 / 0.04), 0 16px 40px rgb(20 39 51 / 0.08)",
        elevated: "0 22px 70px rgb(20 39 51 / 0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
