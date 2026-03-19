import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';
import NoticesList from '@/components/NoticesList';

export default async function NoticePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'Guest';
  
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile) userRole = profile.role;
  }

  const isAdmin = ['Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon'].includes(userRole);

  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('notice_date', { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full pt-32 pb-24">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      
      <main className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              공지사항
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
              교회의 주요 행사와 소식들을 전해드립니다.
            </p>
          </div>
          
          {isAdmin && (
            <Link 
              href="/notice/write"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg hover:scale-105 active:scale-95 shadow-indigo-500/20"
            >
              <PenSquare className="w-5 h-5" />
              공지 등록
            </Link>
          )}
        </div>

        {/* Notices Timeline */}
        {notices && notices.length > 0 ? (
          <NoticesList notices={notices} isAdmin={isAdmin} />
        ) : (
          <div className="text-center py-32 text-neutral-500">
            등록된 공지사항이 없습니다.
          </div>
        )}
      </main>
    </div>
  );
}
