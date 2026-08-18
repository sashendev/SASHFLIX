import withPWAInit from "@ducanh2912/next-pwa";
import { NextConfig } from "next/dist/server/config";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    // Runtime caching strategies
    // API calls – try network first, fallback to cache
    runtimeCaching: [
      {
        urlPattern: /\/(api|auth)\//,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
        },
      },
      // Static assets – cache first
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp|css|js|json)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
        },
      },
      // Video streaming – always network (no caching)
      {
        urlPattern: /\.(?:mp4|webm|m3u8|ts)$/,
        handler: "NetworkOnly",
      },
    ],
  },
  // Offline fallback configuration: serve the custom offline page when a document request fails.
  fallbacks: {
    document: "/~offline",
  },
});

/**
 * Security headers applied to every response.
 *
 * Notes:
 * - Content-Security-Policy is intentionally omitted at this level because the app
 *   embeds third-party player iframes (vidsrc, vidlink, etc.) whose origins cannot
 *   all be enumerated in a static CSP. A future improvement would be to add a
 *   report-only CSP to gather violation data.
 * - Strict-Transport-Security is added here but Vercel also injects it at the CDN
 *   layer for production deployments.
 * - frame-ancestors is set to 'self' to prevent clickjacking.
 */
const securityHeaders = [
  {
    // Prevent browsers from MIME-type sniffing the response body.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Prevent the application from being embedded in iframes on other origins.
    // This is the legacy header; the CSP frame-ancestors directive is preferred
    // for modern browsers but both are set for maximum compatibility.
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Control how much referrer information is included in requests to third
    // parties (e.g. the embedded player iframes).
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Allow fullscreen for the embedded streaming player frames.
    // The application relies on third-party player iframes (vidsrc, vidlink, etc.),
    // so fullscreen must be enabled for those origins as well.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=*",
  },
  {
    // HSTS: tell browsers to only connect via HTTPS for 1 year.
    // Vercel also injects this at the CDN layer, so this is belt-and-suspenders.
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // Minimal CSP that at least blocks framing from foreign origins.
    // A more comprehensive CSP should be added incrementally.
    // 'unsafe-inline' is required for Next.js inline styles/scripts; removing it
    // would break the app without additional work.
    key: "Content-Security-Policy",
    value: [
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Retain original resolve extensions while using the default bundler (Webpack).
  // No explicit turbopack configuration is needed; setting experimental.turbopack
  // to false (below) forces Next.js to use Webpack, which is compatible with
  // @ducanh2912/next-pwa.
  experimental: {
    // Webpack is used by default for next-pwa compatibility; no explicit turbopack flag needed.
    optimizePackageImports: ["@heroui/react"],
    prefetchInlining: true,
  },
  // Provide an empty turbopack config to silence Turbopack‑webpack conflict warning.
  turbopack: {},
  async headers() {
    return [
      {
        // Apply security headers to all routes.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

const pwa = withPWA(nextConfig);

export default pwa;
