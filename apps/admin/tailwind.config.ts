import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./actions/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {}
  }
};

export default config;
