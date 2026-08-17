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
  // https://github.com/payloadcms/payload/issues/12550#issuecomment-2939070941
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  experimental: {
    optimizePackageImports: ["@heroui/react"],
    prefetchInlining: true,
  },
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
