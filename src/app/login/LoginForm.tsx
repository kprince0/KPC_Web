'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (isLogin) {
        // 로그인 처리
        console.log("Attempting login with", email);
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        console.log("Auth response:", { data: authData, error });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('이메일이나 비밀번호가 일치하지 않습니다.')
          }
          if (error.message.includes('Email not confirmed')) {
             throw new Error('이메일 인증이 필요합니다. 메일함을 확인해주세요.')
          }
          throw error
        }

        // [Self-healing] 프로필 누락 확인 및 자동 생성
        if (authData.user) {
          console.log("Login successful, checking profile...");
          // We don't want a profile check to prevent login, so wrap in try-catch
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', authData.user.id)
              .single();
              
            if (!profile) {
              console.log('Profile missing for existing user, creating one...');
              await supabase
                .from('profiles')
                .upsert([
                  {
                    id: authData.user.id,
                    email: authData.user.email,
                    full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
                    role: 'Member(Pending)',
                  }
                ]);
            }
          } catch (profileErr) {
             console.error("Profile check failed but proceeding:", profileErr);
          }
        }

        console.log("Redirecting to home...");
        window.location.href = '/'
      } else {
        // 회원가입 처리
        if (!name.trim()) {
          throw new Error('이름을 입력해주세요.')
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name.trim(),
            }
          }
        })

        if (error) throw error

        if (data.user) {
          // profiles 테이블에 이름 저장 (RLS상 거부될 수 있으나 트리거가 작동하므로 에러 무시)
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
              {
                id: data.user.id,
                email: data.user.email,
                full_name: name.trim(),
                role: 'Member(Pending)',
              }
            ])
            
          if (profileError) {
             console.log('Profile creation error (safe to ignore if db trigger is active):', profileError.message)
          }

          setSuccessMsg('가입이 성공적으로 완료되었습니다! 이제 로그인해 주세요.')
          setIsLogin(true)
          setPassword('')
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-xl w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-2">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm mb-2">
            {successMsg}
          </div>
        )}

        {!isLogin && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-400 font-medium">이름 (실명)</label>
            <input
              type="text"
              required={!isLogin}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-600"
              placeholder="홍길동"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-neutral-400 font-medium">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-600"
            placeholder="example@email.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-neutral-400 font-medium">비밀번호 (6자리 이상)</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-600"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg w-full transition-colors mt-2 disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {isLoading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/10 text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            setErrorMsg('')
            setSuccessMsg('')
          }}
          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          {isLogin ? '계정이 없으신가요? 회원가입하기' : '이미 계정이 있으신가요? 로그인하기'}
        </button>
      </div>
    </div>
  )
}
