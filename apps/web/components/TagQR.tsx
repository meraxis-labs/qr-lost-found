/**
 * TAG QR — QR code for a tag's finder link
 * -----------------------------------------
 * Used on the dashboard when the user clicks "Show QR" on a tag. We
 * generate a QR code that encodes the finder URL. "Copy URL" copies the
 * link to the clipboard; "Download PNG" saves the QR image for printing or sharing.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";

type Props = { tagId: string; label?: string | null };

export function TagQR({ tagId, label }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const finderUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${tagId}`
      : "";

  useEffect(() => {
    if (!finderUrl) return;
    QRCode.toDataURL(finderUrl, { width: 256, margin: 2 })
      .then(setDataUrl)
      .catch((err) =>
        setGenError(err instanceof Error ? err.message : "Failed to generate QR")
      );
  }, [finderUrl]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tagback-${label ? `${label.replace(/\s+/g, "-")}-` : ""}${tagId.slice(0, 8)}.png`;
    link.click();
    toast.success("QR downloaded");
  }, [dataUrl, tagId, label]);

  const handleCopyUrl = useCallback(() => {
    if (!finderUrl) return;
    void navigator.clipboard.writeText(finderUrl).then(
      () => {
        setCopied(true);
        toast.success("Finder link copied");
      },
      () => {
        toast.error("Could not copy. Copy the link manually or try again.");
      }
    );
  }, [finderUrl]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (genError) {
    return <p className="text-sm text-red-400">{genError}</p>;
  }

  if (!dataUrl) {
    return <p className="text-sm text-slate-400">Generating QR…</p>;
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- QR is a data URL from qrcode lib; next/image does not apply */}
      <img
        src={dataUrl}
        alt={`QR code for ${label ?? "tag"} finder link`}
        className="rounded-lg border border-slate-700 bg-white p-2 max-w-full"
      />
      <button
        type="button"
        onClick={handleCopyUrl}
        className="text-sm text-sky-400 hover:text-sky-300 touch-manipulation"
      >
        {copied ? "Copied!" : "Copy URL"}
      </button>
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
