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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <main className="max-w-3xl w-full mx-auto px-4 py-8">
          <NavTabs />
          {children}
        </main>
      </body>
    </html>
  );
}
