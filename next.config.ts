import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    ROOM_CODE_FIELD_NAME: process.env.ROOM_CODE_FIELD_NAME,
  },
};

export default nextConfig;
