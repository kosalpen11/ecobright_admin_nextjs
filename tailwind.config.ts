import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "#e2e8f0",
        foreground: "#0f172a",
        muted: "#64748b",
        primary: {
          DEFAULT: "#0f766e",
          foreground: "#ffffff",
          strong: "#115e59"
        },
        danger: {
          DEFAULT: "#b91c1c",
          foreground: "#ffffff"
        }
      },
      boxShadow: {
        panel: "0 12px 32px rgba(15, 23, 42, 0.06)"
      },
      backgroundImage: {
        "app-radial": "radial-gradient(circle at top, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)"
      }
    }
  },
  plugins: []
};

export default config;
