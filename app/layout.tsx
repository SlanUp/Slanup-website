import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slanup - Squad Your Plans Up",
  description: "Explore nearby plans and connect with people for amazing experiences",
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
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Bungee+Inline&family=Rubik+Mono+One&family=Black+Ops+One&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
