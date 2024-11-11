import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ["@geniux/google-drive-picker-react"],
	},
};

export default nextConfig;
