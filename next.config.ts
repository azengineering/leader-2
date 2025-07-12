import type {NextConfig} from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

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
      {
        protocol: 'https', // The protocol used (https for Supabase)
        hostname: 'ybtwqxrfrlnbwedajmtz.supabase.co', // Your Supabase Storage hostname
        port: '', // Leave empty unless you have a custom port
        pathname: '/storage/v1/object/public/**', // This is crucial for Supabase Storage
      },
    ],
  },
  // Attempt to disable Next.js build cache entirely
  // cacheHandler: false, // Comment out or remove this line
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default withBundleAnalyzer(nextConfig);
