import type { NextConfig } from "next";
import type { Configuration } from "webpack";

interface WatchOptions {
  ignored: string[];
}

interface WebpackConfig extends Configuration {
  watchOptions: WatchOptions;
}

const nextConfig: NextConfig = {
  webpackDevMiddleware: (config: WebpackConfig) => {
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
