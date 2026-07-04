import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  // next-pwa injects a `webpack` key even when disabled; declaring an empty
  // turbopack config silences Next 16's "webpack config with no turbopack
  // config" warning so `next dev` (Turbopack) still runs. Production builds
  // still use `next build --webpack` since next-pwa's service worker
  // generation itself requires webpack.
  turbopack: {},
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Disabled until iOS layout is stable — stale SW was serving old CSS on phones.
  register: false,
  cacheOnFrontEndNav: false,
});

export default withPWA(nextConfig);
