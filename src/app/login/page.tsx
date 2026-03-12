import LoginForm from './LoginForm'

// layout.tsx가 이미 Navbar와 세션 체크를 처리합니다.
// 이 페이지는 로그인 폼만 렌더링합니다.
export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 pt-32">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">환영합니다</h1>
          <p className="text-neutral-400 text-sm">교회 커뮤니티에 로그인하거나 가입하세요.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
