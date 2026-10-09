import "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Env validation runs here during `next dev` and `next build`.
  cacheComponents: true,
  // partialPrefetching: true, // enabled in the partial prefetching step
  typedRoutes: true,
  reactCompiler: true,
  agentRules: false,
  experimental: {
    turbopackRustReactCompiler: true,
    turbopackGc: true,
    turbopackLazyDynamicImports: true,
    agentUpgrade: "latest",
  },
};

export default nextConfig;
