import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      ignored: ["**/data/**", "**/node_modules/**"],
    };
    return config;
  },
};

export default nextConfig;
