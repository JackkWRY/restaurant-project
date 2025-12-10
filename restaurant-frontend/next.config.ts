import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // อนุญาตเว็บนี้
      },
      // ในอนาคตถ้าใช้ Cloudinary ก็มาเพิ่มตรงนี้
    ],
  },
};

export default nextConfig;
