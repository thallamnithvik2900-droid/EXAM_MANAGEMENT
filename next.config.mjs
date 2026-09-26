/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/dev.db'],
  },
};

export default nextConfig;

