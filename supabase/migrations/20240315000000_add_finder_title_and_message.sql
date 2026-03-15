-- Optional custom title and message shown to finders on /f/[tagId].
-- When null, the app uses default copy ("You found something?" etc.).
ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS finder_title text,
  ADD COLUMN IF NOT EXISTS finder_message text;
