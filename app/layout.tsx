import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slanup - Squad Your Plans Up",
  description: "Create/join nearby plans and connect with people for amazing experiences",
  icons: {
    icon: ['/favicon.ico', '/icon-192.png'],
    apple: ['/icon-192.png', '/icon-512.png'],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Slanup - Squad Your Plans Up",
    description: "Create/join nearby plans and connect with people for amazing experiences",
    url: "https://slanup.com",
    siteName: "Slanup",
    images: [
      {
        url: 'https://slanup.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Slanup - Squad Your Plans Up',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Slanup - Squad Your Plans Up",
    description: "Create/join nearby plans and connect with people for amazing experiences",
    images: ['https://slanup.com/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
