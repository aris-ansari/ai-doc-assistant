/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination:
          "https://ai-doc-assistant-backend-ltpa.onrender.com/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
