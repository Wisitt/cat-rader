/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@petradar/ui", "@petradar/types", "@petradar/api-client"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
