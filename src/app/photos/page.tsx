import AlbumBoard from '@/components/AlbumBoard';
import AdminPhotoUpload from '@/components/AdminPhotoUpload';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function PhotosPage() {
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

  // 사진 앨범(포스트) 목록 조회
  const { data: posts } = await supabase
    .from('photo_posts')
    .select('*')
    .order('created_at', { ascending: false });

  // posts가 null일 경우 빈 배열로 처리
  const albums = posts || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 max-w-7xl mx-auto min-h-screen flex flex-col">
        <div className="mb-12 px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">사진 앨범</h1>
            <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
              교회의 소중한 순간들을 앨범별로 모아보세요.
            </p>
          </div>
          {isAdmin && <AdminPhotoUpload />}
        </div>

        {albums.length > 0 ? (
          <AlbumBoard albums={albums} isAdmin={isAdmin} />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center px-6">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
              <span className="text-3xl text-neutral-600">📸</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-300 mb-2">등록된 앨범이 없습니다.</h3>
            <p className="text-neutral-500">관리자 계정으로 사진을 업로드해 보세요.</p>
          </div>
        )}
      </main>
    </div>
  );
}

