import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The MongoDB driver ships optional native/advanced auth sub-packages
   * (@mongodb-js/zstd, kerberos, mongodb-client-encryption, …) that Vercel's
   * serverless bundler cannot trace. Keeping it external lets Node load the
   * driver directly from node_modules at runtime — the officially
   * recommended setup for Next.js + MongoDB on Vercel.
   */
  serverExternalPackages: ["mongodb"],
};

export default nextConfig;
