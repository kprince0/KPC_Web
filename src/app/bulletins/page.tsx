import BulletinCard from '@/components/BulletinCard';
import AdminBulletinUpload from '@/components/AdminBulletinUpload';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function BulletinsPage() {
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

  // 주보 목록 조회 (실제 DB 연결)
  const { data: bulletins, error } = await supabase
    .from('bulletins')
    .select('*')
    .order('bulletin_date', { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">주보</h1>
            <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">매주 발행되는 교회 주보를 이곳에서 확인하고 다운로드하실 수 있습니다.</p>
          </div>
          {isAdmin && <AdminBulletinUpload />}
        </div>

        {bulletins && bulletins.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {bulletins.map((bulletin) => (
              <BulletinCard
                key={bulletin.id}
                id={bulletin.id}
                title={bulletin.title}
                date={bulletin.bulletin_date}
                fileUrl={bulletin.file_url}
                thumbnailUrl={bulletin.thumbnail_url}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
              <span className="text-3xl text-neutral-600">📄</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-300 mb-2">등록된 주보가 없습니다.</h3>
            <p className="text-neutral-500">관리자 계정으로 주보를 업로드해 보세요.</p>
          </div>
        )}
      </main>
    </div>
  );
}

