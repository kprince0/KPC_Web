import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import EditBulletinForm from './EditBulletinForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBulletinPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let userRole = 'Guest';
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile) userRole = profile.role;

  const isAdmin = ['Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon'].includes(userRole);
  if (!isAdmin) redirect('/unauthorized');

  const { data: bulletin, error } = await supabase
    .from('bulletins')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !bulletin) notFound();

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 px-6 max-w-2xl mx-auto min-h-screen flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">주보 정보 수정</h1>
          <p className="text-neutral-400">등록된 주보의 이름(제목)과 날짜를 수정합니다.</p>
        </div>

        <EditBulletinForm bulletin={bulletin} />
      </main>
    </div>
  );
}
