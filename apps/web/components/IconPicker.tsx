/**
 * Icon picker for tags — horizontal list of emoji icons. Used when creating
 * or editing a tag. value is the selected icon id (e.g. "wallet"); onChange
 * is called when the user selects a different icon.
 */

"use client";

import { TAG_ICONS, DEFAULT_TAG_ICON_ID } from "@/lib/tagIcons";

type Props = {
  value: string | null | undefined;
  onChange: (iconId: string | null) => void;
  label?: string;
};

export function IconPicker({ value, onChange, label = "Icon" }: Props) {
  const selectedId = value && TAG_ICONS.some((i) => i.id === value) ? value : DEFAULT_TAG_ICON_ID;

  return (
    <div>
      <span className="block text-sm font-medium text-slate-200 mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {TAG_ICONS.map(({ id, emoji }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            title={id}
            className={`w-10 h-10 rounded-lg border text-xl flex items-center justify-center transition touch-manipulation ${
              selectedId === id
                ? "border-sky-500 bg-sky-500/20 text-slate-50"
                : "border-slate-600 bg-slate-900/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80"
            }`}
            aria-pressed={selectedId === id}
            aria-label={`Select ${id} icon`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
