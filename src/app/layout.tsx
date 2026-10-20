import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "KDU GROUP - Field Extension Officer & Admin Portal",
  description: "Offline-capable smart field data collection and analytics portal for KDU GROUP Ceylon Tea smallholder operations.",
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
