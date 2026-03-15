/**
 * ROOT LAYOUT
 * -----------
 * This file wraps every page in the app. Next.js uses it as the top-level
 * template: the <html> and <body> tags live here, and each route's content
 * is injected as the `children` prop. So the structure is always:
 *   html → body → [AuthStatus] [children wrapper] → actual page content
 *
 * We use a flex column (flex flex-col) so the header stays at the top and
 * the content area takes the rest of the space. min-h-[100dvh] makes the
 * body at least one viewport tall so we don't get a tiny extra scroll on
 * mobile when the page is short. The inner div has min-h-0 so the flex
 * child can shrink and doesn't force the page to be taller than the viewport.
 */

import "./globals.css";
import type { ReactNode } from "react";
import { AuthStatus } from "@/components/AuthStatus";
import { Footer } from "@/components/Footer";

// Shown in the browser tab and in search engine snippets.
export const metadata = {
  title: "Tagback — QR Lost & Found",
  description: "Privacy-preserving QR code tags for your valuables."
};

// viewportFit: "cover" lets the app use the full screen on notched devices;
// initialScale: 1 prevents mobile browsers from zooming on load.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] flex flex-col bg-slate-950 text-slate-50 antialiased">
        <AuthStatus />
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
