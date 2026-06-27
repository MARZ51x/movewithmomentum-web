import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer renders server-side; keep it out of the bundler so its
  // node/font internals load correctly in the route handler.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
