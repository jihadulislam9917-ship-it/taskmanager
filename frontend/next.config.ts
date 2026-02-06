import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: [], // Add external image domains here if needed
  },
};

export default nextConfig;
