import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Forward /api calls to the backend so the browser never needs CORS or secrets.
  // Defaults to the local FastAPI instance used by this project.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_TARGET || "http://127.0.0.1:8001"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
