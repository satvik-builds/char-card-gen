import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next ignores unrelated parent lockfiles.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
