import type { NextConfig } from "next";

// MERIDIAN Data Analyst Template — Next.js config
//
// Two deployment modes:
//
// 1. Development / private repo (default):
//    `bun run dev` runs the full Next.js with API routes, Prisma, etc.
//    This is the "full code" experience.
//
// 2. Static export for GitHub Pages (public repo `demoanalytics`):
//    Set NEXT_PUBLIC_STATIC_EXPORT=1 in the build env to enable `output: 'export'`.
//    The export produces a static site that can be hosted on GitHub Pages.
//
// basePath is required for GitHub Pages project sites (https://<user>.github.io/<repo>/).
// Set NEXT_PUBLIC_BASE_PATH=/demoanalytics in the build env.
//
// Example for the testdemoqwenai2025-creator/demoanalytics repo:
//   NEXT_PUBLIC_STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/demoanalytics bun run build

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: isStaticExport ? 'export' : 'standalone',
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: isStaticExport,
  reactStrictMode: false,
};

export default nextConfig;
