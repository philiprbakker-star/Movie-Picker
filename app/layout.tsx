import type { Metadata } from "next";
import "./globals.css";
import { NavTabs } from "@/components/NavTabs";

export const metadata: Metadata = {
  title: "Movie Picker",
  description: "Top movies & series per streaming platform, with AI suggestions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavTabs />
        <main className="w-full px-4 sm:px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
