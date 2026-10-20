import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

/* KDU GROUP brand assets (Cloudinary) */
const KDU_LOGO_URL =
  "https://res.cloudinary.com/dhd06wdov/image/upload/v1781669562/logokdu_xo5m6f.png";

/* 1200x630 branded share image: logo centred on dark-emerald canvas */
const KDU_OG_IMAGE =
  "https://res.cloudinary.com/dhd06wdov/image/upload/w_1200,h_630,c_pad,g_center,b_rgb:052e21/v1781669562/logokdu_xo5m6f.png";

const SITE_URL = "https://kdu-innactive.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "KDU GROUP - Field Extension Officer & Admin Portal",
  description:
    "KDU GROUP Ceylon Tea — offline-capable field data collection, Rainforest Alliance audits and admin analytics for tea smallholder operations.",
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

  /* Browser tab icon + phone home-screen icon */
  icons: {
    icon: [{ url: KDU_LOGO_URL, type: "image/png" }],
    shortcut: [KDU_LOGO_URL],
    apple: [{ url: KDU_LOGO_URL, sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: KDU_LOGO_URL }],
  },

  /* Link previews: WhatsApp, Facebook, Messenger, Telegram, LinkedIn… */
  openGraph: {
    type: "website",
    siteName: "KDU GROUP",
    title: "KDU GROUP 🍃 Ceylon Tea Field Portal",
    description:
      "ව්‍යාප්ති නිලධාරී සහ පරිපාලන පද්ධතිය — offline field data capture, RA audits & live analytics for KDU tea factories.",
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: KDU_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "KDU GROUP — Ceylon Tea Field Extension & Admin Portal",
      },
    ],
  },

  /* X / Twitter card */
  twitter: {
    card: "summary_large_image",
    title: "KDU GROUP 🍃 Ceylon Tea Field Portal",
    description:
      "Offline field data capture, Rainforest Alliance audits & live analytics for KDU tea factories.",
    images: [KDU_OG_IMAGE],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KDU GROUP",
  },
};

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
