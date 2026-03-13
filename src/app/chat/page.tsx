import ChatRoom from '@/components/ChatRoom';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ChatPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let userRole = 'Guest';
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
  if (profile) userRole = profile.role;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">채팅방</h1>
          <p className="text-neutral-400">성도님들과 실시간으로 교제하는 공간입니다.</p>
        </div>
        <ChatRoom currentUserId={user.id} userRole={userRole} />
      </main>
    </div>
  );
}
