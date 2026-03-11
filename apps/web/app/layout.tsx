import "./globals.css";
import type { ReactNode } from "react";
import { AuthStatus } from "@/components/AuthStatus";

export const metadata = {
  title: "Tagback — QR Lost & Found",
  description: "Privacy-preserving QR code tags for your valuables."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-50 antialiased">
        <AuthStatus />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
