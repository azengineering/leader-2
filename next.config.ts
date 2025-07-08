import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Add this line to enable standalone output
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', 
      },
    ],
  },
  // Add this to disable webpack cache for server builds
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.cache = false;
    }
    return config;
  },
  // Attempt to disable Next.js build cache entirely
  // cacheHandler: false, // Comment out or remove this line
};

export default nextConfig;
