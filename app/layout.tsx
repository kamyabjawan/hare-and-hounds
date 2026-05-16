import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Hare & Hounds",
  description: "Realtime Telegram Mini App board game with Hare vs Hounds matchmaking.",
  applicationName: "Hare & Hounds",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Hare & Hounds",
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#070b12"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
