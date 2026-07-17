import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["yahoo-finance2", "@prisma/client", "bcryptjs"],
};

export default nextConfig;
