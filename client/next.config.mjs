/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Produces a minimal ~150MB image instead of ~1GB
  images: {
    remotePatterns: [
      { 
        protocol: 'https', 
        hostname: '*.amazonaws.com', // AWS S3 buckets
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com', // AWS S3 default domain
      },
      {
        protocol: 'https',
        hostname: 's3.*.amazonaws.com', // Regional S3 buckets
      },
    ],
  },
};

export default nextConfig;
