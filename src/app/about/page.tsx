import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import AboutClient from './AboutClient';

export default async function AboutPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // 세션 확인
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'Guest';
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile) userRole = profile.role;
  }

  const isAdmin = ['Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon'].includes(userRole);

  // 소개 페이지 데이터 조회 (site_config 테이블)
  const { data: config } = await supabase
    .from('site_config')
    .select('content')
    .eq('id', 'about_page')
    .single();

  const defaultAboutData = {
    hero_title: "빛과 사랑을 전하는 공동체",
    hero_description: "우리는 예수 그리스도의 사랑을 실천하며 세상의 빛이 되기 위해 모인 믿음의 공동체입니다. 하나님의 은혜로운 임재를 경험하고 나누는 자리에 당신을 초대합니다.",
    vision_title: "우리의 비전",
    vision_desc: "하나님의 나라를 확장하며 세상을 변화시키는 제자들의 공동체",
    values_title: "핵심 가치",
    values_desc: "예배 중심, 제자 훈련, 지역 사회 섬김, 다음 세대 양육",
    members_title: "함께하는 분들",
    members_desc: "김강일 담임목사와 모든 성도님들이 함께 세워나가는 교회"
  };

  const aboutData = config?.content || defaultAboutData;

  return (
    <AboutClient data={aboutData} isAdmin={isAdmin} />
  );
}

