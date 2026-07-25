/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep native/Node-only backend deps out of the bundler so they load
    // correctly at runtime in server routes / actions.
    serverComponentsExternalPackages: [
      "pdf-parse",
      "firebase-admin",
      "exceljs",
    ],
  },
};

export default nextConfig;
