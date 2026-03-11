"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = { tagId: string; label?: string | null };

/**
 * Shows a QR code for the finder URL (BASE_URL/f/tagId) and optional PNG download.
 * Used on the dashboard (P2 — QR code generation).
 */
export function TagQR({ tagId, label }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
