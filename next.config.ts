import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ~/package-lock.json があると workspace root を誤認するため明示する
  // （npm scripts 経由の実行では cwd = プロジェクトルート）
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "ufs.sh",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
