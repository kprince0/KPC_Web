'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';

export default function EditBulletinForm({ bulletin }: { bulletin: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(bulletin.title || '');
  const [bulletinDate, setBulletinDate] = useState(bulletin.bulletin_date || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bulletinDate) return;

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { error } = await supabase
        .from('bulletins')
        .update({
          title: title.trim(),
          bulletin_date: bulletinDate,
        })
        .eq('id', bulletin.id);

      if (error) throw error;

      router.push('/bulletins');
      router.refresh();
      
    } catch (error) {
      console.error('Error updating bulletin:', error);
      alert('주보 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-300">주보 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 2026년 3월 2주차 주보"
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-300">주보 날짜</label>
        <input
          type="date"
          value={bulletinDate}
          onChange={(e) => setBulletinDate(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
          required
        />
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-full text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '수정 완료'}
        </button>
      </div>
    </form>
  );
}
