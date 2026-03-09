import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      ignored: ["**/data/**", "**/node_modules/**"],
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/ErikThiart/cryptocurrency-icons/**",
      },
    ],
  },
};

export default nextConfig;
