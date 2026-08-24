import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// Shared metadata establishes the browser-facing identity of the application and supports
// consistent document titles and descriptions across the platform.
export const metadata: Metadata = {
  title: "MIDI Library",
  description: "Songscription fullstack take-home",
};

// The root layout wraps the entire application in the base HTML shell and ensures a consistent
// presentation layer for all pages within the project.
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
