import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import EditNoticeForm from './EditNoticeForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NoticeEditPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const userRole = profile?.role || 'Guest';
  const isAdmin = ['Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon'].includes(userRole);

  if (!isAdmin) {
    redirect('/unauthorized');
  }

  const { data: notice, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !notice) notFound();

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">공지사항 수정</h1>
          <p className="text-lg text-neutral-400 leading-relaxed">
            등록하신 공지사항의 내용을 수정합니다.
          </p>
        </div>

        <EditNoticeForm notice={notice} />
      </main>
    </div>
  );
}
