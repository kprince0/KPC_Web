import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import SermonPlayer from '@/components/SermonPlayer';
import AdminSermonUpload from '@/components/AdminSermonUpload';
import Link from 'next/link';
import { Video, PenSquare } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';

export default async function SermonsPage() {
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

  // Fetch sermons
  const { data: sermons } = await supabase
    .from('sermons')
    .select('*')
    .order('sermon_date', { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              설교 말씀
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
              잭슨빌 한인 장로교회의 주일 예배 및 특별 집회 설교 영상입니다.
            </p>
          </div>
          
          {isAdmin && (
            <AdminSermonUpload />
          )}
        </div>

        {sermons && sermons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sermons.map((sermon) => (
              <div key={sermon.id} className="bg-neutral-900/40 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col h-full">
                <SermonPlayer 
                  youtubeId={sermon.youtube_id || ''} 
                  thumbnailUrl={sermon.thumbnail_url || `https://img.youtube.com/vi/${sermon.youtube_id}/maxresdefault.jpg`}
                  title={sermon.title}
                />
                <div className="p-4 flex flex-col justify-between flex-1 bg-neutral-900/80">
                  <div>
                    <h3 className="text-xl font-bold mb-1 truncate">{sermon.title}</h3>
                    <div className="flex justify-between items-center text-sm text-neutral-400">
                      <span>{sermon.preacher} 목사</span>
                      <span>{sermon.sermon_date}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 italic">{sermon.scripture}</p>
                  </div>
                  
                  {isAdmin && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                       <Link 
                          href={`/sermons/edit/${sermon.id}`}
                          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                          title="설교 수정"
                       >
                         <PenSquare className="w-4 h-4" />
                       </Link>
                       <DeleteButton postId={sermon.id} tableName="sermons" redirectPath="/sermons" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
              <Video className="w-10 h-10 text-neutral-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-300 mb-2">등록된 설교 영상이 없습니다.</h3>
            <p className="text-neutral-500">곧 은혜로운 말씀으로 채워질 예정입니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}
