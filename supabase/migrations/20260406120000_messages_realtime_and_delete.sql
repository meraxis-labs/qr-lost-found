-- Realtime: owners receive postgres_changes for messages they can SELECT (RLS).
-- REPLICA IDENTITY FULL so UPDATE/DELETE payloads include enough row data for clients.
ALTER TABLE public.messages REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Tag owners may delete individual messages (e.g. spam) without removing the tag.
CREATE POLICY "Tag owners can delete messages for their tags"
  ON public.messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tags
      WHERE tags.id = messages.tag_id
        AND tags.owner_id = auth.uid()
    )
  );
