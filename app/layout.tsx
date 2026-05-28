import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eco Bright Admin",
  description: "Eco Bright Admin v1"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
