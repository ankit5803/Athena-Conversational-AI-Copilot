import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   output: "export",
//   /* config options here */
// };

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false,
  },
  images: {
    domains: ["img.clerk.com"], // 👈 Add this line
  },
  // <-- add this
  serverExternalPackages: ["mongoose"], // <-- and this
};

export default nextConfig;
