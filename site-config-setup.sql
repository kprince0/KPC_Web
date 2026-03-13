-- Site Config Table for Dynamic Content (About Page, etc.)
CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Select: Anyone
CREATE POLICY "Public Select Site Config" ON public.site_config FOR SELECT USING (true);

-- Manage: Admins Only
CREATE POLICY "Admin Manage Site Config" ON public.site_config FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon')));

-- Initial Data for About Page if missing
INSERT INTO public.site_config (id, content)
VALUES ('about_page', '{
  "hero_title": "빛과 사랑을 전하는 공동체",
  "hero_description": "우리는 예수 그리스도의 사랑을 실천하며 세상의 빛이 되기 위해 모인 믿음의 공동체입니다. 하나님의 은혜로운 임재를 경험하고 나누는 자리에 당신을 초대합니다.",
  "vision_title": "우리의 비전",
  "vision_desc": "하나님의 나라를 확장하며 세상을 변화시키는 제자들의 공동체",
  "values_title": "핵심 가치",
  "values_desc": "예배 중심, 제자 훈련, 지역 사회 섬김, 다음 세대 양육",
  "members_title": "함께하는 분들",
  "members_desc": "김강일 담임목사와 모든 성도님들이 함께 세워나가는 교회"
}')
ON CONFLICT (id) DO NOTHING;
