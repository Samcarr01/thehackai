/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // IMAGES: Configure for Supabase public URLs
  images: {
    domains: ['ndhljslogveuhijpifwf.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ndhljslogveuhijpifwf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Reduce auth interference
    unoptimized: false,
  },
  
  // SECURITY: Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig