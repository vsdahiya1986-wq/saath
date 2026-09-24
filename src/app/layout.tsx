import type { Metadata, Viewport } from "next";
// Self-hosted, not next/font/google: that fetches from Google at build time,
// which failed a CI build outright ("Can't resolve
// @vercel/turbopack-next/internal/font/google/font") on nothing but a network
// hiccup. The font ships in an offline-first app inside a Capacitor WebView,
// so it has no business depending on the network to build. The variable file
// covers 200–800, which spans the weights in use.
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import AudioRouteGuard from "@/components/AudioRouteGuard";

export const metadata: Metadata = {
  title: "SAATH",
  description: "Memory companion",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#065f46",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--bg)]">
        <RegisterServiceWorker />
        <AudioRouteGuard />
        {children}
      </body>
    </html>
  );
}
