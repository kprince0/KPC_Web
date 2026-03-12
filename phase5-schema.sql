-- 1. Enable Realtime for chat_messages (Important for message visibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;

-- 2. Add is_chat_blocked column to profiles (for kick/ban feature)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_chat_blocked BOOLEAN DEFAULT false;

-- 3. Enhance chat_messages for edits/deletes
-- Note: Already exists, but adding is_edited for UI hint IF NOT EXISTS
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 4. Update Chat Policies for Security
-- Allow authors to delete/update their own messages
CREATE POLICY "Users can update own messages" 
ON public.chat_messages FOR UPDATE 
USING (auth.uid() = user_id AND NOT is_deleted);

CREATE POLICY "Users can delete own messages" 
ON public.chat_messages FOR DELETE 
USING (auth.uid() = user_id);

-- Allow Admins to delete any message
CREATE POLICY "Admins can delete any chat message" 
ON public.chat_messages FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Block banned users from sending messages
-- Note: We need to modify the existing insert policy or drop/re-create
DROP POLICY IF EXISTS "Approved members can insert chat" ON public.chat_messages;
CREATE POLICY "Approved members can insert chat" 
ON public.chat_messages FOR INSERT 
WITH CHECK (
  public.is_approved_or_admin(auth.uid()) AND 
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_chat_blocked = true
  )
);
