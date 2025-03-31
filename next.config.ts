import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'sjc.microlink.io'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
