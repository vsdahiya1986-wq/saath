import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import AudioRouteGuard from "@/components/AudioRouteGuard";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SAATH",
  description: "Memory companion",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#060a13",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[var(--bg)]">
        <div className="aurora" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <RegisterServiceWorker />
        <AudioRouteGuard />
        <div className="app-root flex-1 flex flex-col min-h-full">{children}</div>
      </body>
    </html>
  );
}
