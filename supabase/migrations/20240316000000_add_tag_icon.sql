-- Optional icon for a tag (e.g. wallet, keys). Stored as a key; UI maps to emoji or asset.
ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS icon text;
