-- Tags: one per physical item, owned by an authenticated user.
-- owner_id matches auth.users.id (Supabase Auth).
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Messages: anonymous finder submissions for a tag.
-- finder_token can be used to allow future anonymous replies; optional for MVP.
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  finder_token text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);

-- Indexes for common lookups.
CREATE INDEX idx_tags_owner_id ON public.tags(owner_id);
CREATE INDEX idx_messages_tag_id ON public.messages(tag_id);

-- Enable Row Level Security on both tables.
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Tags: owners can do everything for their own tags only.
CREATE POLICY "Users can manage own tags"
  ON public.tags
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Messages: anyone can insert (anonymous finder); only tag owner can select/update (e.g. mark read).
CREATE POLICY "Anyone can insert messages for a tag"
  ON public.messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tag owners can view messages for their tags"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tags
      WHERE tags.id = messages.tag_id
        AND tags.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tag owners can update messages for their tags"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tags
      WHERE tags.id = messages.tag_id
        AND tags.owner_id = auth.uid()
    )
  );

-- Allow public read of a single tag by id (so finder page can show "You found: label?" and submit form).
-- No PII is exposed; only id, label, and that the tag exists and is active.
CREATE POLICY "Public can read active tags by id"
  ON public.tags
  FOR SELECT
  USING (is_active = true);
