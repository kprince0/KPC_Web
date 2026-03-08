-- 1. Notices Table (Announcements / 광고)
CREATE TABLE public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Storing parsed bullet points/sections flexibly
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  notice_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Columns Table (Pastor's Message / 목회자 칼럼)
CREATE TABLE public.columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  publish_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;

-- Notices Policies
CREATE POLICY "Approved members can view notices" 
ON public.notices FOR SELECT 
USING (public.is_approved_or_admin(auth.uid()));

CREATE POLICY "Admins can insert notices" 
ON public.notices FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update notices" 
ON public.notices FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete notices" 
ON public.notices FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Columns Policies
CREATE POLICY "Anyone can view columns" 
ON public.columns FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert columns" 
ON public.columns FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update columns" 
ON public.columns FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete columns" 
ON public.columns FOR DELETE 
USING (public.is_admin(auth.uid()));
