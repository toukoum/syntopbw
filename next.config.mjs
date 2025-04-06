/** @type {import('next').NextConfig} */
const nextConfig = {


  images: {
    domains: [
      'plum-accurate-bobcat-724.mypinata.cloud',
      'ipfs.io',
      'gateway.pinata.cloud'
    ],
  },

  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  
  // If you also have TypeScript errors, you might want to add:
  typescript: {
    // Disable TypeScript checks during builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
