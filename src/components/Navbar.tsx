'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Navbar({ userRole = 'Guest' }: { userRole?: string }) {
  const [scrolled, setScrolled] = useState(false)

  const adminRoles = ['Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon']
  const isAdmin = adminRoles.includes(userRole)
  const isLoggedIn = userRole !== 'Guest'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-neutral-950/80 border-b border-white/10 backdrop-blur-xl py-4' : 'bg-neutral-950/40 backdrop-blur-md py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
          <img 
            src="https://static.wixstatic.com/media/61d770_4fa2366d7d314c91999da3acaa6551be~mv2.jpg/v1/fill/w_120,h_73,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/NEW%20LOGO%20Only%20no%20Text.jpg" 
            alt="Jacksonville Korean Presbyterian Church Logo"
            className="h-10 w-auto object-contain brightness-110"
          />
        </Link>
        
        <ul className="flex items-center gap-4 md:gap-6 text-sm font-medium text-neutral-300 whitespace-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <li className="flex-shrink-0"><Link href="/about" className="hover:text-white transition-colors">교회소개</Link></li>
          <li className="flex-shrink-0"><Link href="/sermons" className="hover:text-white transition-colors">설교</Link></li>
          <li className="flex-shrink-0"><Link href="/bulletins" className="hover:text-white transition-colors">주보</Link></li>
          <li className="flex-shrink-0"><Link href="/board" className="hover:text-white transition-colors">자유게시판</Link></li>
          
          {isLoggedIn && (
            <>
              <li className="flex-shrink-0"><Link href="/chat" className="hover:text-white transition-colors">채팅방</Link></li>
              <li className="flex-shrink-0"><Link href="/photos" className="hover:text-white transition-colors">사진</Link></li>
            </>
          )}

          {isAdmin && (
            <li className="flex-shrink-0">
              <Link href="/notice/write" className="text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1 rounded-md">
                공지작성
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide">Role: {userRole}</span>
          </div>
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="text-sm px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors hover:scale-105 active:scale-95 duration-200 block text-center"
            >
              로그인
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/mypage"
                className="text-sm px-4 py-2 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors hover:scale-105 active:scale-95 duration-200 block text-center"
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/20 transition-colors hover:scale-105 active:scale-95 duration-200"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
