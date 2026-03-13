-- Jacksonville Korean Presbyterian Church (JAXKPC)
-- Comprehensive Migration: Latest Content & Admin Security Enforcement

-- 1. [Fix & Setup] Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  preacher TEXT DEFAULT '담임목사',
  scripture TEXT,
  sermon_date DATE NOT NULL,
  youtube_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bulletins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  bulletin_date DATE NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. [Sermons] Inserting Latest 10 Sermons from jaxkpc.org
-- Clean old data (Optional)
TRUNCATE TABLE public.sermons;

INSERT INTO public.sermons (title, youtube_id, preacher, sermon_date, youtube_url)
VALUES 
('10.12.2025 주일예배', 'pdN9TfCsh_I', '정재두 목사', '2025-10-12', 'https://www.youtube.com/watch?v=pdN9TfCsh_I'),
('2025년 10월 5일 주일예배', '-y-D5uXkMao', '정재두 목사', '2025-10-05', 'https://www.youtube.com/watch?v=-y-D5uXkMao'),
('2025년 09월 28일 주일예배', 'VwxJYZf985I', '정재두 목사', '2025-09-28', 'https://www.youtube.com/watch?v=VwxJYZf985I'),
('2025년 09월 21일 주일예배', 'pdMPfwyPhkQ', '정재두 목사', '2025-09-21', 'https://www.youtube.com/watch?v=pdMPfwyPhkQ'),
('2025년 09월 14일 주일예배', 'KDajrhX6Z4o', '정재두 목사', '2025-09-14', 'https://www.youtube.com/watch?v=KDajrhX6Z4o'),
('2025년 09월 07일 주일예배', 'UFA3_R5TyF8', '정재두 목사', '2025-09-07', 'https://www.youtube.com/watch?v=UFA3_R5TyF8'),
('2025년 08월 31일 주일예배', '-VfZlBwCcEI', '정재두 목사', '2025-08-31', 'https://www.youtube.com/watch?v=-VfZlBwCcEI'),
('2025년 08월 24일 주일예배', 'nGbqn3hfwmo', '정재두 목사', '2025-08-24', 'https://www.youtube.com/watch?v=nGbqn3hfwmo'),
('2025년 08월 17일 주일예배', 'LY7uNymP84A', '정재두 목사', '2025-08-17', 'https://www.youtube.com/watch?v=LY7uNymP84A'),
('2025년 08월 10일 주일예배', '2aCG9k6stNk', '정재두 목사', '2025-08-10', 'https://www.youtube.com/watch?v=2aCG9k6stNk');

-- 3. [Photos] Inserting Recent Church Events
TRUNCATE TABLE public.photo_posts CASCADE;

INSERT INTO public.photo_posts (title, content, author_id, attachments)
VALUES 
('10.12.2025 야외예배', '전교인과 함께하는 야외예배 현장입니다.', (SELECT id FROM profiles WHERE role IN ('Admin', 'Pastor') LIMIT 1), '[{"url": "https://static.wixstatic.com/media/61d770_dce481f0bb24451da6b49a25d8084d60~mv2.jpg", "name": "outside.jpg"}]'::jsonb),
('10.12.2025 전교인 야유회', '풍성한 가을, 즐거운 야유회 시간이었습니다.', (SELECT id FROM profiles WHERE role IN ('Admin', 'Pastor') LIMIT 1), '[{"url": "https://static.wixstatic.com/media/61d770_9afa50b046a24885a53aec6ecf0ebadc~mv2.png", "name": "picnic.png"}]'::jsonb),
('10.10.2025 정재두 목사님 첫 성경공부', '새롭게 시작된 성경 공부 클래스 풍경입니다.', (SELECT id FROM profiles WHERE role IN ('Admin', 'Pastor') LIMIT 1), '[{"url": "https://static.wixstatic.com/media/61d770_38e78864789547ea8730999071597813~mv2.jpg", "name": "bible_study.jpg"}]'::jsonb);

-- 4. [Bulletins] Inserting placeholder for recent bulletins
INSERT INTO public.bulletins (title, file_url, bulletin_date)
VALUES 
('2025년 10월 12일 주보', '#', '2025-10-12'),
('2025년 10월 05일 주보', '#', '2025-10-05'),
('2025년 09월 28일 주보', '#', '2025-09-28');

-- 5. [Security] Strict Admin-Only Controls (RLS)
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_board_posts ENABLE ROW LEVEL SECURITY;

-- Select: Anyone
DROP POLICY IF EXISTS "Public Select" ON public.sermons;
CREATE POLICY "Public Select" ON public.sermons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Select" ON public.bulletins;
CREATE POLICY "Public Select" ON public.bulletins FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Select" ON public.photo_posts;
CREATE POLICY "Public Select" ON public.photo_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Select" ON public.free_board_posts;
CREATE POLICY "Public Select" ON public.free_board_posts FOR SELECT USING (true);

-- Manage (Insert/Update/Delete): Admins Only
DO $$ 
DECLARE 
  table_name TEXT;
  tables TEXT[] := ARRAY['sermons', 'bulletins', 'notices', 'photo_posts', 'free_board_posts'];
BEGIN
  FOREACH table_name IN ARRAY tables LOOP
    EXECUTE 'DROP POLICY IF EXISTS "Admin Manage ' || table_name || '" ON public.' || table_name;
    EXECUTE 'CREATE POLICY "Admin Manage ' || table_name || '" ON public.' || table_name || 
            ' FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN (''Admin'', ''Pastor'', ''Elder'', ''MediaTeam'', ''Deacon'')))';
  END LOOP;
END $$;
