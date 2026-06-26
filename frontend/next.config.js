const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained server bundle (.next/standalone) for a small
  // production Docker image — only the files actually needed are copied and
  // node_modules is pruned. See frontend/Dockerfile.
  output: "standalone",

  // Transpile ESM-only packages (pdfjs-dist@5.x) so Next.js webpack handles them correctly
  transpilePackages: ["pdfjs-dist", "react-pdf"],

  // ── Performance optimizations ────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Static asset headers for caching
  async headers() {
    return [
      {
        source: "/:path*.(svg|png|jpg|jpeg|gif|webp|ico|woff2?)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.(js|css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

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

    // ── Webpack optimizations ─────────────────────────────────────
    // Tree-shaking and bundle size reduction
    // NOTE: Do NOT replace splitChunks.cacheGroups — overriding Next.js defaults
    // (which include framework, lib, app-lib groups) breaks module resolution.
    // Instead, merge our vendor-heavy group into the existing cache groups.
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/](framer-motion|@dnd-kit|axios|sonner)[\\/]/,
            name: "vendor-heavy",
            priority: 10,
            chunks: "all",
          },
        },
      },
    };

    return config;
  },
};

module.exports = withNextIntl(nextConfig);