/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/types",
    "@workspace/services",
    "@workspace/database",
    "@workspace/auth",
  ],
  allowedDevOrigins: ["192.168.1.246", "localhost", "127.0.0.1", "*.localhost"],
}

export default nextConfig
