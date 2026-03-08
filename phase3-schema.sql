-- 1. Photo Posts & Attachments Table
CREATE TABLE public.photo_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.photo_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.photo_posts(id) ON DELETE CASCADE,
  gdrive_file_id TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Photos
ALTER TABLE public.photo_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone approved can view photo posts" 
ON public.photo_posts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND role IN ('Member(Approved)', 'Pastor', 'Elder', 'MediaTeam', 'Deacon', 'Admin')
  )
);

CREATE POLICY "Admins can insert photo posts" 
ON public.photo_posts FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update photo posts" 
ON public.photo_posts FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete photo posts" 
ON public.photo_posts FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Policy for attachments inherits basically same logic
CREATE POLICY "Anyone approved can view attachments" 
ON public.photo_attachments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND role IN ('Member(Approved)', 'Pastor', 'Elder', 'MediaTeam', 'Deacon', 'Admin')
  )
);

CREATE POLICY "Admins can insert attachments" 
ON public.photo_attachments FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete attachments" 
ON public.photo_attachments FOR DELETE 
USING (public.is_admin(auth.uid()));


-- 2. Chat Messages Table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Helper to check if user is approved or admin
CREATE OR REPLACE FUNCTION public.is_approved_or_admin(user_id uuid) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role IN ('Member(Approved)', 'Pastor', 'Elder', 'MediaTeam', 'Deacon', 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Approved members can view chat" 
ON public.chat_messages FOR SELECT 
USING (public.is_approved_or_admin(auth.uid()));

CREATE POLICY "Approved members can insert chat" 
ON public.chat_messages FOR INSERT 
WITH CHECK (public.is_approved_or_admin(auth.uid()));

-- Optional: Enable Realtime for chat_messages table
-- Note: You must also run this command to enable it in Supabase logic:
alter publication supabase_realtime add table public.chat_messages;
