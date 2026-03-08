-- Helper Function to Check Admin Roles
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role IN ('Pastor', 'Elder', 'MediaTeam', 'Deacon', 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Sermons Table
CREATE TABLE public.sermons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT,
  title TEXT NOT NULL,
  preacher TEXT NOT NULL,
  scripture TEXT NOT NULL,
  thumbnail_url TEXT,
  sermon_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sermons" 
ON public.sermons FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert sermons" 
ON public.sermons FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update sermons" 
ON public.sermons FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete sermons" 
ON public.sermons FOR DELETE 
USING (public.is_admin(auth.uid()));

-- 2. Bulletins Table
CREATE TABLE public.bulletins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  bulletin_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.bulletins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bulletins" 
ON public.bulletins FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert bulletins" 
ON public.bulletins FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update bulletins" 
ON public.bulletins FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete bulletins" 
ON public.bulletins FOR DELETE 
USING (public.is_admin(auth.uid()));

-- 3. Storage Bucket Configuration (Run in Supabase SQL Editor if standard postgres setup fails on buckets)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bulletins', 'bulletins', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Bulletins Storage" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'bulletins' );

CREATE POLICY "Admins can upload to Bulletins Storage" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'bulletins' AND public.is_admin(auth.uid()) );

CREATE POLICY "Admins can update Bulletins Storage" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'bulletins' AND public.is_admin(auth.uid()) );

CREATE POLICY "Admins can delete Bulletins Storage" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'bulletins' AND public.is_admin(auth.uid()) );
