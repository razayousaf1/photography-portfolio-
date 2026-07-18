import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shammaqfilms.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shammaq Bin Faisal — Photography",
    template: "%s — Shammaq Bin Faisal",
  },
  description:
    "Shammaq Bin Faisal is a photographer working across fashion, product, corporate, wedding, and commercial work — cinematic imagery, shot with intent.",
  keywords: [
    "Shammaq Bin Faisal",
    "photographer",
    "best photographer",
    "premium photographer",
    "professional photographer",
    "cinematic photography",
    "corporate photography",
    "content shoot",
    "fashion photography",
    "wedding photography Pakistan",
    "product photography",
    "commercial photography",
  ],
  openGraph: {
    title: "Shammaq Bin Faisal — Photography",
    description:
      "Cinematic photography across fashion, product, corporate, weddings, and commercial work.",
    url: siteUrl,
    siteName: "Shammaq Bin Faisal",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <div className="grain-overlay" aria-hidden="true" />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "!bg-charcoal !border !border-champagne/30 !text-paper",
            },
          }}
        />
      </body>
    </html>
  );
}
