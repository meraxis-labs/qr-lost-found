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

type Props = { tagId: string; label?: string | null };

export function TagQR({ tagId, label }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /**
   * WHY we build the full URL only on the client:
   * - window.location.origin (e.g. https://app.example.com) exists only in the
   *   browser. During Server-Side Rendering (SSR), Next.js runs this component
   *   on the server where there is no "window" — so we'd get a ReferenceError.
   * - By checking typeof window !== "undefined", we use the real origin when
   *   the component runs in the browser, and an empty string during SSR so we
   *   don't try to generate a QR for an invalid URL. The useEffect below
   *   only runs QRCode.toDataURL when finderUrl is non-empty (i.e. on the client).
   */
  const finderUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${tagId}`
      : "";

  /**
   * Generate the QR code image when we have a valid finderUrl (client-side).
   * QRCode.toDataURL is async and returns a promise; we store the result in
   * state so we can use it in an <img src={dataUrl} />. width/margin control
   * the size and quiet zone of the QR for reliable scanning.
   */
  useEffect(() => {
    if (!finderUrl) return;
    QRCode.toDataURL(finderUrl, { width: 256, margin: 2 })
      .then(setDataUrl)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to generate QR"));
  }, [finderUrl]);

  /**
   * handleDownload: programmatically trigger a file download of the QR as PNG.
   * We use useCallback so the function reference is stable and safe to pass
   * to onClick (avoids unnecessary re-renders of the button). We create a
   * temporary <a> with download attribute and .click() it — the browser then
   * downloads the data URL as a file. The filename includes the label (sanitized
   * for spaces) and first 8 chars of tagId so the user can tell files apart.
   */
  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tagback-${label ? `${label.replace(/\s+/g, "-")}-` : ""}${tagId.slice(0, 8)}.png`;
    link.click();
  }, [dataUrl, tagId, label]);

  const handleCopyUrl = useCallback(() => {
    if (!finderUrl) return;
    void navigator.clipboard.writeText(finderUrl).then(
      () => setCopied(true),
      () => setError("Could not copy. Copy the link manually or try again.")
    );
  }, [finderUrl]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  // Show error state if QR generation failed (e.g. invalid URL or library error).
  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  // Show loading state until we have the image. Happens on first paint on client.
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
