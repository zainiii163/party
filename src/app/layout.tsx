import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import { Snowfall } from "@/components/effects/snowfall";
import { InvitationGate } from "@/components/invitation-gate";
import { MotionProvider } from "@/components/effects/motion-provider";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const inter = localFont({
  src: "../../public/fonts/inter-latin.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const playfair = localFont({
  src: "../../public/fonts/playfair-display-latin.woff2",
  variable: "--font-playfair",
  display: "swap",
  weight: "400 900",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cousins Winter Reunion 2026 — You're Invited",
    template: "%s | Cousins Winter Reunion 2026",
  },
  description: "A magical winter celebration of family, food, games and memories. Open your invitation, RSVP and help us plan the Cousins Winter Reunion 2026.",
  applicationName: "Cousins Winter Reunion 2026",
  openGraph: {
    title: "Cousins Winter Reunion 2026 — You're Invited",
    description: "One family. Endless memories. One unforgettable winter reunion.",
    type: "website",
    url: siteUrl,
    siteName: "Cousins Winter Reunion 2026",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cousins Winter Reunion 2026 invitation" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#081426",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <MotionProvider>
          <Snowfall />
          <InvitationGate />
          {children}
          <Toaster />
          <ScrollToTop />
        </MotionProvider>
      </body>
    </html>
  );
}
