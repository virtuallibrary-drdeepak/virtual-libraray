/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['virtual-library-web.netlify.app', 'upload.wikimedia.org', 'cdn.jsdelivr.net'],
  },
}

module.exports = nextConfig

