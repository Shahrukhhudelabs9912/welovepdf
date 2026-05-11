/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  turbopack: {
    // Set the root directory for Turbopack
    // The root should be the directory containing node_modules/next
    // Since Turbopack is looking from frontend/app, and node_modules/next is in frontend/node_modules/next
    // The relative path is ..
    root: '..'
  }
};

module.exports = nextConfig;
