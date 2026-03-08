import './globals.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Church Web Platform',
  description: '새로운 안티그래비티 디자인 - 은혜가 넘치는 커뮤니티',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-neutral-950 text-white min-h-screen font-sans antialiased">
        <Navbar userRole="Admin" /> {/* Defaulted to Admin for presentation / phase 1 test */}
        {children}
      </body>
    </html>
  )
}
