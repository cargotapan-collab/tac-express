/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  allowedDevOrigins: ["192.168.1.246", "localhost"],
}

export default nextConfig
