import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User, Shield, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

export default async function MyPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let userRole = 'Guest';
  let userName = '사용자';
  const { data: profile } = await supabase.from('profiles').select('role, full_name, created_at').eq('id', user.id).single();
  if (profile) {
    userRole = profile.role;
    userName = profile.full_name || '사용자';
  }

  const roleColors: Record<string, string> = {
    'Admin': 'text-red-400 bg-red-500/10 border-red-500/20',
    'Pastor': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'Elder': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Member(Approved)': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'Member(Pending)': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    'Guest': 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20',
  };
  const roleColor = roleColors[userRole] || roleColors['Guest'];

  return (
    <div className="bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">마이페이지</h1>
          <p className="text-neutral-400">내 계정 정보를 확인하세요.</p>
        </div>

        <div className="space-y-4">
          {/* Profile Card */}
          <div className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{userName}</h2>
                <p className="text-sm text-neutral-400">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3 text-neutral-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">역할</span>
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${roleColor}`}>
                  {userRole}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3 text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">가입일</span>
                </div>
                <span className="text-sm text-neutral-300">
                  {profile?.created_at ? dayjs(profile.created_at).format('YYYY년 MM월 DD일') : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Pending Notice */}
          {userRole === 'Member(Pending)' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
              <p className="text-yellow-400 font-semibold mb-1">⏳ 승인 대기 중</p>
              <p className="text-sm text-yellow-400/70">
                관리자의 승인을 기다리고 있습니다. 승인 후 게시판, 채팅방 등 모든 기능을 이용하실 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
