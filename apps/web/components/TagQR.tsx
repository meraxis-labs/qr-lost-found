/**
 * TAG QR — QR code for a tag's finder link
 * -----------------------------------------
 * Used on the dashboard when the user clicks "Show QR" on a tag. We
 * generate a QR code that encodes the finder URL (e.g. https://app.example.com/f/abc123).
 * The finder can scan it with their phone to open the finder page and send
 * a message. We also show the URL as text and a "Download PNG" button so
 * the user can print or share the QR.
 *
 * We use the "qrcode" library to turn the URL into a data URL (base64 image)
 * in the browser. We need typeof window !== "undefined" because this can
 * run during SSR where window doesn't exist.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = { tagId: string; label?: string | null };

export function TagQR({ tagId, label }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build the full URL only on the client (window.origin)
  const finderUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${tagId}`
      : "";

  useEffect(() => {
    if (!finderUrl) return;
    QRCode.toDataURL(finderUrl, { width: 256, margin: 2 })
      .then(setDataUrl)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to generate QR"));
  }, [finderUrl]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tagback-${label ? `${label.replace(/\s+/g, "-")}-` : ""}${tagId.slice(0, 8)}.png`;
    link.click();
  }, [dataUrl, tagId, label]);

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!dataUrl) {
    return <p className="text-sm text-slate-400">Generating QR…</p>;
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <img
        src={dataUrl}
        alt={`QR code for ${label ?? "tag"} finder link`}
        className="rounded-lg border border-slate-700 bg-white p-2 max-w-full"
      />
      <a
        href={finderUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-sky-400 hover:text-sky-300 break-all text-center"
      >
        {finderUrl}
      </a>
      <button
        type="button"
        onClick={handleDownload}
        className="text-sm text-slate-300 hover:text-slate-50 border border-slate-600 rounded-lg px-4 py-2.5 min-h-[44px] touch-manipulation"
      >
        Download PNG
      </button>
    </div>
  );
}
