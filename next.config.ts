import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upfnirzyhwvigxcouvfm.supabase.co',
        pathname: '/storage/v1/object/public/product-images/**',
      },
    ],
  },
}

export default nextConfig