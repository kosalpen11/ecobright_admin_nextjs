import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  transpilePackages: ["@eco-bright/db", "@eco-bright/validators"],
  outputFileTracingRoot: path.join(__dirname, "../..")
};

export default nextConfig;
