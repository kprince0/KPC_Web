'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar({ userRole = 'Guest' }: { userRole?: string }) {
  const [scrolled, setScrolled] = useState(false)

  const adminRoles = ['Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon']
  const isAdmin = adminRoles.includes(userRole)
  const isApproved = isAdmin || userRole === 'Member(Approved)'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-neutral-950/70 border-b border-white/10 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white">
          CHURCH<span className="text-indigo-400">.</span>
        </Link>
        
        <ul className="flex items-center gap-8 text-sm font-medium text-neutral-300">
          <li><Link href="/about" className="hover:text-white transition-colors">교회소개</Link></li>
          
          {isApproved && (
            <>
              <li><Link href="/board" className="hover:text-white transition-colors">자유게시판</Link></li>
              <li><Link href="/chat" className="hover:text-white transition-colors">채팅방</Link></li>
            </>
          )}

          {isAdmin && (
            <>
              <li><Link href="/photos" className="hover:text-white transition-colors">사진게시판</Link></li>
              <li><Link href="/notice/write" className="text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1 rounded-md">공지작성</Link></li>
            </>
          )}
        </ul>

        <div className="flex items-center gap-4">
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-neutral-300 border border-white/10 backdrop-blur-md shadow-sm">
            {userRole}
          </span>
          <button className="text-sm px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors hover:scale-105 active:scale-95 duration-200">
            {userRole === 'Guest' ? '로그인' : '마이페이지'}
          </button>
        </div>
      </div>
    </nav>
  )
}
