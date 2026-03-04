import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
  // Inline DATABASE_URL at build time so it's available in Amplify SSR Lambda
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
