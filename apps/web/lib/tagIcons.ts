/**
 * Tag icons — shared list of icon keys and their emoji display.
 * Used when creating/editing tags and when displaying them on the dashboard.
 */

export const TAG_ICONS = [
  { id: "tag", emoji: "🏷️", label: "Tag" },
  { id: "wallet", emoji: "💳", label: "Wallet" },
  { id: "laptop", emoji: "💻", label: "Laptop" },
  { id: "keys", emoji: "🔑", label: "Keys" },
  { id: "bag", emoji: "🎒", label: "Bag" },
  { id: "phone", emoji: "📱", label: "Phone" },
  { id: "camera", emoji: "📷", label: "Camera" },
  { id: "watch", emoji: "⌚", label: "Watch" },
  { id: "briefcase", emoji: "💼", label: "Briefcase" },
  { id: "headphones", emoji: "🎧", label: "Headphones" },
] as const;

export const DEFAULT_TAG_ICON_ID = TAG_ICONS[0].id;

export function getTagIconEmoji(iconId: string | null | undefined): string {
  if (!iconId) return TAG_ICONS[0].emoji;
  const found = TAG_ICONS.find((i) => i.id === iconId);
  return found?.emoji ?? TAG_ICONS[0].emoji;
}
