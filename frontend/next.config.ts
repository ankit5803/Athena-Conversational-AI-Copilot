import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   output: "export",
//   /* config options here */
// };

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
