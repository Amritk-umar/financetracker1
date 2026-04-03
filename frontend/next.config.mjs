/** @type {import('next').NextConfig} */
const nextConfig = {typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete 
    // even if your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Also ignore linting errors (like unused variables) during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
