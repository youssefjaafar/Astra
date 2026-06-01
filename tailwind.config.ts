import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 48px rgba(79, 209, 255, 0.14)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.28)",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(-120px, 90px, 0)" },
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.38" },
          "50%": { opacity: "0.78" },
        },
      },
      animation: {
        drift: "drift 48s linear infinite alternate",
        pulseLine: "pulseLine 4s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
