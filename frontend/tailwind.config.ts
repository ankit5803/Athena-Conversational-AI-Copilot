import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media", // or 'class' for manual dark mode toggle
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            table: {
              width: "100%",
              borderCollapse: "collapse",
            },
            "th, td": {
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "0.5rem 1rem",
            },
            th: {
              backgroundColor: "rgba(255,255,255,0.05)",
              fontWeight: "600",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
