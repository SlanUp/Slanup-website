import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slanup - Squad Your Plans Up",
  description: "Create/join nearby plans and connect with people for amazing experiences",
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
    other: [
      {
        rel: 'icon',
        url: '/favicon.ico',
      },
    ],
  },
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
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
