import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = '5d-creator-app';

const nextConfig: NextConfig = {
  output: 'export',
  // Set the basePath for GitHub Pages deployment
  basePath: `/${repoName}`,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
