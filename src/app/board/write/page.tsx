import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import WritePostForm from './WritePostForm';

export default async function WritePostPage() {
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
  
  // 비로그인 사용자는 로그인 페이지로 리다이렉트
  if (!user) {
    redirect('/login');
  }

  let userRole = 'Guest';
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile) userRole = profile.role;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">글쓰기</h1>
          <p className="text-neutral-400">자유게시판에 새로운 글을 작성합니다.</p>
        </div>

        <WritePostForm />
      </main>
    </div>
  );
}


