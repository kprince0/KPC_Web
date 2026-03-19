import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import EditPostForm from './EditPostForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
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
  
  if (!user) {
    redirect('/login');
  }

  // 게시글 정보 가져오기
  const { data: post, error } = await supabase
    .from('free_board_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  // 권한 체크 (작성자 또는 관리자만 수정 가능)
  let userRole = 'Guest';
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile) userRole = profile.role;

  const isAdmin = ['Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon'].includes(userRole);
  const isAuthor = user.id === post.author_id;

  if (!isAdmin && !isAuthor) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">게시글 수정</h1>
          <p className="text-neutral-400">등록하신 글을 수정합니다.</p>
        </div>

        <EditPostForm post={post} />
      </main>
    </div>
  );
}
