const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile ESM-only packages (pdfjs-dist@5.x) so Next.js webpack handles them correctly
  transpilePackages: ["pdfjs-dist", "react-pdf"],

  webpack: (config, { isServer }) => {
    // pdfjs-dist and react-pdf need these Node-specific modules stubbed out in browser
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        encoding: false,
      };
    }

    // Let webpack handle .mjs files as standard JavaScript modules
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};

module.exports = withNextIntl(nextConfig);