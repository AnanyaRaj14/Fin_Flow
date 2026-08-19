/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Produces a minimal ~150MB image instead of ~1GB
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
