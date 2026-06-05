import type { Metadata } from "next";
import "@/app/globals.css";
import { Toaster } from "sonner";

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
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
