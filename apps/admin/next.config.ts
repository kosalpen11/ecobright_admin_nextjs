import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@eco-bright/db", "@eco-bright/validators"],
  outputFileTracingRoot: path.join(__dirname, "../..")
};

export default nextConfig;
