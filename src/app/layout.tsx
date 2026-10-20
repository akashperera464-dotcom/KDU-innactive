import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import "./globals.css";

/*
 * Brand assets are SELF-HOSTED in /public so social crawlers (WhatsApp,
 * Facebook, Telegram…) always get a fast, same-origin image — no third-party
 * dependency, no slow first-fetch timeouts that break link previews.
 *   /kdu-logo.png  → favicon, apple-touch-icon (square crest)
 *   /og-image.png  → 1200×630 share card (crest on dark emerald canvas)
 */

const FALLBACK_HOST = "akashpereraproject27.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  /* Resolve the real host at request time so og:* absolute URLs are correct
     on every deployment (Vercel project domain, sandbox preview, custom). */
  let base = `https://${FALLBACK_HOST}`;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    if (host) base = `${proto}://${host}`;
  } catch {
    /* headers unavailable (static generation) — keep fallback */
  }

  const title = "KDU GROUP 🍃 Ceylon Tea Field Portal";
  const description =
    "ව්‍යාප්ති නිලධාරී සහ පරිපාලන පද්ධතිය — offline field data capture, Rainforest Alliance audits & live analytics for KDU tea factories.";

  return {
    metadataBase: new URL(base),
    title: "KDU GROUP - Field Extension Officer & Admin Portal",
    description,
    applicationName: "KDU GROUP",
    authors: [{ name: "KDU GROUP" }],
    keywords: [
      "KDU",
      "KDU GROUP",
      "tea factory",
      "Ceylon tea",
      "extension officer",
      "Rainforest Alliance",
      "field data collection",
    ],

    /* Browser tab icon + phone home-screen icon (same-origin) */
    icons: {
      icon: [{ url: "/kdu-logo.png", type: "image/png" }],
      shortcut: ["/kdu-logo.png"],
      apple: [{ url: "/kdu-logo.png", sizes: "180x180", type: "image/png" }],
    },

    /* Link previews: WhatsApp, Facebook, Messenger, Telegram, LinkedIn… */
    openGraph: {
      type: "website",
      siteName: "KDU GROUP",
      title,
      description,
      url: base,
      locale: "en_US",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "KDU GROUP — Ceylon Tea Field Extension & Admin Portal",
          type: "image/png",
        },
      ],
    },

    /* X / Twitter card */
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },

    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "KDU GROUP",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#064E3B",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#111827] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
