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
//    In this mode, API routes don't run; the markets page falls back to
//    client-side fetching directly from public APIs.
//
// basePath is set automatically when NEXT_PUBLIC_BASE_PATH is provided
// (e.g. NEXT_PUBLIC_BASE_PATH=/demoanalytics for GitHub Pages project sites).

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  // In static export mode, use 'export'; otherwise use 'standalone' for dev
  output: isStaticExport ? 'export' : 'standalone',

  // GitHub Pages serves under /<repo-name>/ for project sites
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,

  // Required for static export (no Node.js server at runtime)
  images: {
    unoptimized: true,
  },

  // Trailing slash makes GitHub Pages routing cleaner
  trailingSlash: isStaticExport,

  // Don't fail the build on lint errors in static export (CI-friendly)
  eslint: {
    ignoreDuringBuilds: isStaticExport,
  },
  typescript: {
    ignoreBuildErrors: isStaticExport,
  },

  reactStrictMode: false,
};

export default nextConfig;
