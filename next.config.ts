import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    watchOptions: {
      ignored: ["**/supabase/data/**", "**/supabase/storage/**"],
    },
  },
};

export default nextConfig;
