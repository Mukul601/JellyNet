import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Backend API routes
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
      // Proxy routes — forwarded to backend (frontend test page hits these)
      {
        source: "/proxy/:path*",
        destination: "http://localhost:8000/proxy/:path*",
      },
      // Health check
      {
        source: "/health",
        destination: "http://localhost:8000/health",
      },
    ];
  },
};

export default nextConfig;
