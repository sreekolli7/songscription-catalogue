import type { Metadata } from "next";
// @ts-expect-error The global stylesheet is resolved by Next.js at build time.
import "./globals.css";

export const metadata: Metadata = {
  title: "MIDI Library",
  description: "Songscription fullstack take-home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
