import './globals.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Church Web Platform',
  description: '새로운 안티그래비티 디자인 - 은혜가 넘치는 커뮤니티',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  let userRole = 'Guest';

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile) userRole = profile.role;
    }
  } catch (e) {
    // Supabase 오류 시 Guest로 폴백 (앱 크래시 방지)
    console.error('Auth check failed:', e);
  }

  return (
    <html lang="ko">
      <body suppressHydrationWarning className="bg-neutral-950 text-white min-h-screen font-sans antialiased">
        <Navbar userRole={userRole} />
        {children}
      </body>
    </html>
  )
}
