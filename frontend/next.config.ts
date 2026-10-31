import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Forward /api calls to the backend so the browser never needs CORS or secrets
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_TARGET || "http://localhost:3001"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
