-- Jacksonville Korean Presbyterian Church Data Replication & Admin Security Enforcement

-- 1. [Sermons] Duplicating "Your Community" category data
-- Clear existing placeholder data if any (Optional - Comment out if you want to keep existing)
-- DELETE FROM public.sermons;

INSERT INTO public.sermons (title, youtube_id, preacher, scripture, sermon_date, youtube_url)
VALUES 
('10.12.2025 주일예배', 'sAxuI76Psls', '담임', '본문 참조', '2025-10-12', 'https://www.youtube.com/watch?v=sAxuI76Psls'),
('2025년 10월 5일 주일예배', '_FNkAvELb24', '담임', '본문 참조', '2025-10-05', 'https://www.youtube.com/watch?v=_FNkAvELb24'),
('2025년 09월 28일 주일예배', 'VwxJYZf985I', '담임', '본문 참조', '2025-09-28', 'https://www.youtube.com/watch?v=VwxJYZf985I'),
('2025년 3월 30일 주일예배', 'K3Vs3fQOfOY', '담임', '본문 참조', '2025-03-30', 'https://www.youtube.com/watch?v=K3Vs3fQOfOY'),
('2024년 2월 25일 주일예배', 'm8z_LgX33J8', '담임', '마태복음 5:1-12', '2024-02-25', 'https://www.youtube.com/watch?v=m8z_LgX33J8');

-- 2. [Photos] Duplicating "Getting Started" category data
-- Prepare sample posts with external image URLs
INSERT INTO public.photo_posts (title, content, author_id, attachments)
VALUES 
('10.12.2025 야외예배', '전교인과 함께하는 야외예배 현장입니다.', (SELECT id FROM profiles WHERE role = 'Admin' LIMIT 1), '[{"url": "https://static.wixstatic.com/media/61d770_dce481f0bb24451da6b49a25d8084d60~mv2.jpg", "name": "outside.jpg"}]'::jsonb),
('10.12.2025 전교인 야유회', '풍성한 가을, 즐거운 야유회 시간이었습니다.', (SELECT id FROM profiles WHERE role = 'Admin' LIMIT 1), '[{"url": "https://static.wixstatic.com/media/61d770_9afa50b046a24885a53aec6ecf0ebadc~mv2.png", "name": "picnic.png"}]'::jsonb),
('8월 단체사진', '8월 예배 후 단체 사진입니다.', (SELECT id FROM profiles WHERE role = 'Admin' LIMIT 1), '[{"url": "https://static.wixstatic.com/media/61d770_6360cef4f92e4108974b52a6550f017f~mv2.png", "name": "group_photo.png"}]'::jsonb);

-- 3. [Security] Enforcing Admin-only Controls via RLS
-- Ensure ONLY admins can Insert/Update/Delete

-- Sermons
DROP POLICY IF EXISTS "Enable admin write" ON public.sermons;
CREATE POLICY "Enable admin write" ON public.sermons
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon')
  )
);

-- Photo Posts
DROP POLICY IF EXISTS "Enable admin write photo" ON public.photo_posts;
CREATE POLICY "Enable admin write photo" ON public.photo_posts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon')
  )
);

-- Free Board
DROP POLICY IF EXISTS "Enable admin write board" ON public.free_board_posts;
CREATE POLICY "Enable admin write board" ON public.free_board_posts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon')
  )
);

-- Notices
DROP POLICY IF EXISTS "Enable admin write notice" ON public.notices;
CREATE POLICY "Enable admin write notice" ON public.notices
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon')
  )
);
