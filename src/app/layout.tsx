import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Treningsapp",
  description: "Treningsbelastning, PMC, leaderboard og kalender for vennegjengen.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Treningsapp",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-512.png" }],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f5" },
    { media: "(prefers-color-scheme: dark)", color: "#050506" },
  ],
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (!t) t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
`;

const appShellScript = `
(function() {
  var BUILD = 'pwa-v8';
  document.documentElement.setAttribute('data-build', BUILD);

  function isStandaloneMode() {
    return !!(
      window.navigator.standalone ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches
    );
  }

  function measureSafeBottom() {
    var host = document.body || document.documentElement;
    var probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;bottom:0;left:0;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom);';
    host.appendChild(probe);
    var measured = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
    host.removeChild(probe);
    return measured > 0 ? measured : 34;
  }

  function applyStandalone() {
    var safeBottom = measureSafeBottom();
    document.documentElement.classList.add('standalone-app');
    document.documentElement.style.setProperty('--pwa-safe-bottom', safeBottom + 'px');
    var style = document.createElement('style');
    style.id = 'pwa-nav-fix';
    style.textContent =
      'html.standalone-app .bottom-nav-root{position:fixed!important;right:0!important;bottom:0!important;left:0!important;z-index:10000!important;margin:0!important;padding-top:0.375rem!important;padding-right:max(0.75rem,env(safe-area-inset-right,0px))!important;padding-left:max(0.75rem,env(safe-area-inset-left,0px))!important;padding-bottom:' +
      safeBottom +
      'px!important;background:var(--background,#050506)!important;transform:translateZ(0)!important;-webkit-transform:translateZ(0)!important}html.standalone-app .bottom-nav-root .nav-island{border:none!important;border-radius:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:transparent!important;max-width:none!important}html.standalone-app .ptr-scroll{padding-bottom:calc(4rem + ' +
      safeBottom +
      'px)!important}html.standalone-app,html.standalone-app body{background:var(--background,#050506)!important}';
    document.head.appendChild(style);
  }

  function lockAppShell() {
    var path = location.pathname;
    if (path.indexOf('/login') === 0 || path.indexOf('/signup') === 0) return;
    document.documentElement.classList.add('app-locked');
    if (document.body) document.body.classList.add('app-locked');
  }

  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        regs.forEach(function(r) { r.unregister(); });
      });
    }
    if ('caches' in window) {
      caches.keys().then(function(names) {
        names.forEach(function(name) { caches.delete(name); });
      });
    }
    if (isStandaloneMode()) {
      applyStandalone();
    }
    lockAppShell();
    document.addEventListener('DOMContentLoaded', function() {
      if (isStandaloneMode()) applyStandalone();
      lockAppShell();
    });
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${jakarta.variable} ${geistMono.variable} h-[100dvh] antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: appShellScript }} />
      </head>
      <body className="h-[100dvh] overflow-hidden bg-background antialiased">
        <ThemeProvider>
          <AppChrome>{children}</AppChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
