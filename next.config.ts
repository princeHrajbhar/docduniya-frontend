import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.FRONTEND_BUILD_DIR || ".next",
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    // Administrators sign in through the separate portal; query strings (?next=) are kept.
    return [{ source: "/login/admin", destination: "/administrator/login", permanent: false }];
  },
};

export default nextConfig;
