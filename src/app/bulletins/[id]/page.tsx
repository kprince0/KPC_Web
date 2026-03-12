import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Download, Calendar, ArrowLeft } from 'lucide-react';

export default async function BulletinDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // 1. 현재 주보 조회
  const { data: bulletin } = await supabase
    .from('bulletins')
    .select('*')
    .eq('id', id)
    .single();

  if (!bulletin) notFound();

  // 2. 이전/다음 주보 조회 (날짜 기준)
  const { data: prevBulletin } = await supabase
    .from('bulletins')
    .select('id')
    .lt('bulletin_date', bulletin.bulletin_date)
    .order('bulletin_date', { ascending: false })
    .limit(1)
    .single();

  const { data: nextBulletin } = await supabase
    .from('bulletins')
    .select('id')
    .gt('bulletin_date', bulletin.bulletin_date)
    .order('bulletin_date', { ascending: true })
    .limit(1)
    .single();

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -z-10" />

      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto min-h-screen flex flex-col">
        {/* Header Actions */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link 
            href="/bulletins" 
            className="group flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            목록으로 돌아가기
          </Link>

          <a 
            href={bulletin.file_url} 
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" />
            주보 다운로드
          </a>
        </div>

        {/* Info Area */}
        <div className="mb-12">
          <div className="flex items-center gap-3 text-indigo-400 mb-3">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-mono tracking-widest uppercase">{bulletin.bulletin_date}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{bulletin.title}</h1>
        </div>

        {/* PDF Viewer Container */}
        <div className="relative aspect-[3/4.2] w-full bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group">
          <iframe 
            src={`${bulletin.file_url}#toolbar=0`}
            className="w-full h-full border-none"
            title={bulletin.title}
          />
          
          {/* Mobile Overlay Suggestion */}
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent md:hidden">
            <p className="text-xs text-neutral-400 text-center">PDF 뷰어에서 내용을 확대하거나 스크롤할 수 있습니다.</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-12 grid grid-cols-2 gap-6">
          {prevBulletin ? (
            <Link 
              href={`/bulletins/${prevBulletin.id}`}
              className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                <ChevronLeft className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">이전 주보</p>
                <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">이전 주의 소식 보기</p>
              </div>
            </Link>
          ) : (
            <div className="opacity-30 p-6 bg-white/5 border border-white/10 rounded-2xl cursor-not-allowed">
               <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">이전 주보</p>
               <p className="text-sm font-semibold text-white">마지막 주보입니다</p>
            </div>
          )}

          {nextBulletin ? (
            <Link 
              href={`/bulletins/${nextBulletin.id}`}
              className="flex items-center justify-end text-right gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">다음 주보</p>
                <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">최신 주보로 이동</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                <ChevronRight className="w-6 h-6 text-indigo-400" />
              </div>
            </Link>
          ) : (
            <div className="opacity-30 p-6 bg-white/5 border border-white/10 rounded-2xl text-right cursor-not-allowed">
               <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">다음 주보</p>
               <p className="text-sm font-semibold text-white">가장 최신 주보입니다</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
