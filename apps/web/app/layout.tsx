import "./globals.css";
import type { ReactNode } from "react";

/**
 * Global metadata for the App Router.
 *
 * Next.js will inject this into the document <head> for all routes
 * rendered under this layout. Keep this focused on app-wide SEO and
 * sharing defaults; route-specific overrides should live in their
 * respective pages/layouts.
 */
export const metadata = {
  title: "Tagback — QR Lost & Found",
  description: "Privacy-preserving QR code tags for your valuables."
};

/**
 * Root layout for the web app.
 *
 * This wraps every page rendered by the App Router. Anything that should
 * exist "around" all screens (global navigation, toasts, context
 * providers, etc.) belongs here.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* The body-level classes define the base visual language (dark theme). */}
      <body className="bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
