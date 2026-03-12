/**
 * ROOT LAYOUT
 * -----------
 * This file wraps every page in the app. Next.js uses it as the top-level
 * template: the <html> and <body> tags live here, and each route's content
 * is injected as the `children` prop.
 *
 * Structure:
 * - We load global CSS (colors, fonts, safe areas).
 * - We render the AuthStatus header (Log in / Sign up or user email + Log out).
 * - We render the current page content inside a flex container so the layout
 *   fills the viewport and only scrolls when content is tall (e.g. dashboard).
 */

import "./globals.css";
import type { ReactNode } from "react";
import { AuthStatus } from "@/components/AuthStatus";

// Shown in the browser tab and in search results.
export const metadata = {
  title: "Tagback — QR Lost & Found",
  description: "Privacy-preserving QR code tags for your valuables."
};

// Tells mobile browsers to use the full screen and not zoom on load.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] flex flex-col bg-slate-950 text-slate-50 antialiased">
        {/* Top bar: "Tagback" link + Log in / Sign up (or email + Log out) */}
        <AuthStatus />
        {/* Page content: flex-1 so it takes remaining space; min-h-0 so it doesn't force extra scroll */}
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </body>
    </html>
  );
}
