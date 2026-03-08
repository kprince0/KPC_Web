import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Initialize Supabase SSR
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Fetch User Object
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Define the Router Path
  const path = request.nextUrl.pathname;
  let userRole = 'Guest';

  // 4. Fetch the specific profile role
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile) userRole = profile.role;
  }

  // 5. Define Role Access Arrays
  const adminRoles = ['Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon'];
  const approvedRoles = [...adminRoles, 'Member(Approved)'];

  // 6. Access Restrictions
  const requiresApproved = path.startsWith('/board') || path.startsWith('/chat');
  const requiresAdmin = path.startsWith('/notice/write') || path.startsWith('/photos');

  const isGuest = !user || userRole === 'Guest' || userRole === 'Member(Pending)';

  if (requiresApproved && isGuest) {
    // Redirect unapproved users from boards/chat
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (requiresAdmin && !adminRoles.includes(userRole)) {
    // Redirect non-admins from photos/notice write pages
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return supabaseResponse;
}

export const config = {
  // Apply middleware routing globally except static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
