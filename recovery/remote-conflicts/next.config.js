/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Dev-only: allow the HMR websocket from every loopback/alias the server
  // might be opened through here (Next 16 blocks dev-resource access from
  // mismatched hosts, which silently kills hydration in automated browsers).
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.1.14"],
  experimental: {
    // Keep agent builds gated on published security advisories (Next.js
    // upgrade reminders); no feature flags are enabled here.
    agentUpgrade: "security",
  },
  async headers() {
    // NOTE: Content-Security-Policy is set per-request in proxy.ts (nonce
    // based). A second static CSP here would union with it and break
    // hydration, so CSP must live in exactly one place.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
