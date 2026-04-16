import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXTAUTH_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Backend API routes
      {
        source: "/api/keys",
        destination: `${BACKEND_URL}/api/keys`,
      },
      {
        source: "/api/keys/:path*",
        destination: `${BACKEND_URL}/api/keys/:path*`,
      },
      {
        source: "/api/auth/google",
        destination: `${BACKEND_URL}/api/auth/google`,
      },
      {
        source: "/api/auth/me",
        destination: `${BACKEND_URL}/api/auth/me`,
      },
      {
        source: "/api/auth/wallet/:path*",
        destination: `${BACKEND_URL}/api/auth/wallet/:path*`,
      },
      {
        source: "/api/transactions",
        destination: `${BACKEND_URL}/api/transactions`,
      },
      {
        source: "/api/categories",
        destination: `${BACKEND_URL}/api/categories`,
      },
      {
        source: "/api/payments/:path*",
        destination: `${BACKEND_URL}/api/payments/:path*`,
      },
      {
        source: "/api/test/:path*",
        destination: `${BACKEND_URL}/api/test/:path*`,
      },
      // Proxy routes
      {
        source: "/proxy/:path*",
        destination: `${BACKEND_URL}/proxy/:path*`,
      },
      // Health check
      {
        source: "/health",
        destination: `${BACKEND_URL}/health`,
      },
    ];
  },
};

export default nextConfig;
