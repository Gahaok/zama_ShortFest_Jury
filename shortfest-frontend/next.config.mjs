/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable server-side features for static export
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Note: Headers for WASM and FHEVM (required for v0.9) must be configured at the server level
  // For static export, configure these headers in your web server (nginx, serve, etc.):
  // - Cross-Origin-Opener-Policy: same-origin
  // - Cross-Origin-Embedder-Policy: require-corp
  // - Content-Type: application/wasm (for .wasm files)
};

export default nextConfig;


