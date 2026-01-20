/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode for production
  reactStrictMode: false,
  
  // Image optimization configuration
  images: {
    // Allow images from Wavespeed CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.wavespeed.ai',
      },
      {
        protocol: 'https',
        hostname: 'cdn.wavespeed.ai',
      },
      {
        protocol: 'https',
        hostname: 'api.wavespeed.ai',
      },
    ],
    // Support modern formats for better quality/compression
    formats: ['image/avif', 'image/webp'],
    // Don't optimize external images (they're already optimized)
    unoptimized: false,
    // Increase device sizes for high-DPI displays
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 1024],
  },
  
  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Headers for better caching and security
  async headers() {
    return [
      {
        // API routes should not be cached
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        // Static assets can be cached
        source: '/:path*.(ico|png|jpg|jpeg|svg|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
