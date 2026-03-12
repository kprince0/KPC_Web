'use client';

import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, PenSquare, MessageSquare } from 'lucide-react';

export type BoardPost = {
  id: string;
  no: number;
  title: string;
  author: string;
  date: string;
  views: number;
  comments?: number;
  isNew?: boolean;
};

interface NaverStyleBoardProps {
  posts: BoardPost[];
  title?: string;
  description?: string;
}

export default function NaverStyleBoard({ posts, title = "자유게시판", description = "성도님들이 자유롭게 교제하고 소통하는 공간입니다." }: NaverStyleBoardProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Board Header */}
      <div className="mb-8 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
        <p className="text-neutral-400">{description}</p>
      </div>

      {/* Board Controls (Search & Write) */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="제목, 내용, 글쓴이 검색" 
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 pl-10 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        </div>
        
        <Link href="/board/write" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
          <PenSquare className="w-4 h-4" />
          글쓰기
        </Link>
      </div>

      {/* Modern Glassmorphism Table Container */}
      <div className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 text-sm bg-black/20">
                <th className="py-4 px-6 font-medium text-center w-20">번호</th>
                <th className="py-4 px-6 font-medium">제목</th>
                <th className="py-4 px-6 font-medium text-center w-32">글쓴이</th>
                <th className="py-4 px-6 font-medium text-center w-32">작성일</th>
                <th className="py-4 px-6 font-medium text-center w-24">조회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {posts.map((post) => (
                <tr 
                  key={post.id} 
                  className="group hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6 text-center text-neutral-500 font-mono text-xs">{post.no}</td>
                  <td className="py-4 px-6">
                    <Link href={`/board/${post.id}`} className="flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                      <span className="text-neutral-200 font-medium line-clamp-1">{post.title}</span>
                      {post.comments && post.comments > 0 && (
                        <span className="flex items-center gap-1 text-indigo-400/80 text-xs font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
                          <MessageSquare className="w-3 h-3" />
                          {post.comments}
                        </span>
                      )}
                      {post.isNew && (
                        <span className="text-[10px] font-bold text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-center text-neutral-400">{post.author}</td>
                  <td className="py-4 px-6 text-center text-neutral-500 text-xs">{post.date}</td>
                  <td className="py-4 px-6 text-center text-neutral-500 text-xs font-mono">{post.views}</td>
                </tr>
              ))}
              
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-neutral-500">
                    등록된 게시글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button className="p-2 rounded-full hover:bg-white/10 text-neutral-400 transition-colors disabled:opacity-50 disabled:hover:bg-transparent" disabled>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1 text-sm">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-medium">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 transition-colors">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 transition-colors">3</button>
        </div>
        <button className="p-2 rounded-full hover:bg-white/10 text-neutral-400 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
