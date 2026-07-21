import type { Config } from "tailwindcss";

/** Tokens ported from the EpiMinded brand preview (navy canvas, gold, serif). */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        /** Ultrawide / QHD desktop (2560×1440 and up). */
        uw: "2560px",
      },
      colors: {
        // Black canvas + warm gold — matches the brand hero.
        canvas: "#000000",
        card: "#141210",
        card2: "#1A1611",
        gold: { DEFAULT: "#C9A24B", hi: "#E4C66B", cta: "#DEBA5C" },
        // `accent` is the single interactive token = brand gold (monochrome theme).
        accent: { DEFAULT: "#C9A24B", hi: "#E4C66B" },
        paper: "#F4F1E8",
        body: "#E6E3DA",
        ash: "#BFBCB2",
        muted: "#8B887F",
        line: "#2A261F",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        kicker: "0.28em",
        eyebrow: "0.22em",
        label: "0.2em",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        rise: "rise 0.45s ease both",
        spin: "spin 0.9s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
