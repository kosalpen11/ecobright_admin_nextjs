import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Eco Bright Admin",
  description: "Inventory and admin console for Eco Bright."
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
