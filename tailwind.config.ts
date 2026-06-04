import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          ink: "#172033",
          muted: "#5f6f86",
          panel: "#f8fbff",
          line: "#dbe7f5",
          blue: "#2563eb",
          teal: "#0f9488",
          red: "#dc2626",
          orange: "#ea580c",
          green: "#15803d"
        }
      },
      boxShadow: {
        soft: "0 8px 24px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
