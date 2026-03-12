import NaverStyleBoard from '@/components/NaverStyleBoard';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';

export default async function BoardPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'Guest';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile) userRole = profile.role;
  }

  // 게시글 데이터 가져오기 (Supabase 연결)
  const { data: posts } = await supabase
    .from('free_board_posts')
    .select('*')
    .order('created_at', { ascending: false });

  // NaverStyleBoard 컴포넌트 형식에 맞게 변환
  const boardPosts = (posts || []).map((post, index) => ({
    id: post.id,
    no: (posts?.length || 0) - index,
    title: post.title,
    author: post.author_name,
    date: dayjs(post.created_at).format('YYYY.MM.DD'),
    views: post.view_count || 0,
    comments: 0,
    isNew: dayjs().diff(dayjs(post.created_at), 'day') < 2
  }));

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
        {/* Board Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              자유게시판
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
              교회 성도님들이 일상의 은혜를 나누고 교제하는 공간입니다.
            </p>
          </div>
          
          <Link 
            href="/board/write"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            <PenSquare className="w-5 h-5" />
            글쓰기
          </Link>
        </div>

        {/* Board Content */}
        <div className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
          <NaverStyleBoard posts={boardPosts} />
        </div>
      </main>
    </div>
  );
}
