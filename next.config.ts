import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'sjc.microlink.io'],
  },
  eslint: {
    // Dezactivează ESLint în timpul build-ului
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
