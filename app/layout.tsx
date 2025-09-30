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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
