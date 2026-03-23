/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: '**'},
      {protocol: 'http', hostname: '**'},
    ],
  },
  webpack: (config, {dev}) => {
    // Prevent stale filesystem cache from causing "options.factory" runtime crashes in dev.
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
