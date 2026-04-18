/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    // Use Render API in production, but keep localhost for local dev
    const destination = isProd 
      ? 'https://cognisolve-api.onrender.com/api/:path*' 
      : 'http://127.0.0.1:5000/api/:path*';
      
    return [
      {
        source: '/api/:path*',
        destination: destination,
      },
    ]
  },
};

export default nextConfig;
