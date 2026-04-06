import type { Message, Tag } from "@repo/types";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * CSV for one tag’s messages (UTF-8). Suitable for spreadsheet import.
 */
export function buildMessagesCsv(tag: Tag, messages: Message[]): string {
  const rows: string[][] = [
    ["tag_id", "tag_label", "message_id", "created_at", "read", "content"],
  ];
  const label = tag.label?.trim() || "";
  for (const m of messages) {
    rows.push([
      tag.id,
      label,
      m.id,
      m.createdAt,
      m.read ? "yes" : "no",
      m.content,
    ]);
  }
  return rows.map((r) => r.map((c) => escapeCsvCell(c)).join(",")).join("\r\n");
}

export function downloadTextFile(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}
