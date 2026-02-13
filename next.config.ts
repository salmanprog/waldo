import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Run face-api.js and canvas in Node (not bundled) so isNodejs() works for monkeyPatch
  serverExternalPackages: ["face-api.js", "canvas", "@tensorflow/tfjs-core"],

  // 🔥 FIX: increase upload body size limit
  experimental: {
    middlewareClientMaxBodySize: "100mb", // or "100mb"
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "thorntonstudios.sitestaginglink.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "thorntonstudios.sitestaginglink.com",
        pathname: "/**",
      },
    ],
  },

  turbopack: {},
};

export default nextConfig;
