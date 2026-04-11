import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Disable image optimization for static export (no server)
  images: {
    unoptimized: true,
  },
  // Trailing slashes for clean URLs served by Caddy
  trailingSlash: true,
};

export default nextConfig;
