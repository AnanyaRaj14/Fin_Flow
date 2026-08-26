/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isDev = process.env.NODE_ENV !== 'production';
    const backendUrl = process.env.BACKEND_API_URL || (isDev ? 'http://localhost:5001/api' : 'http://13.232.157.163:5000/api');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
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
